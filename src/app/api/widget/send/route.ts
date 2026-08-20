import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";
import { generateAIReply, extractTagsFromMessage } from "@/lib/ai-reply";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, customerId, customerName, content, messageType = "text" } = body;

    if (!conversationId || !customerId || !content) {
      return NextResponse.json(
        { error: "conversationId, customerId, content are required" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. 插入客户消息
    const { data: msg, error: insertErr } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        customer_id: customerId,
        sender_type: "customer",
        sender_name: customerName || null,
        message_type: messageType,
        content,
        is_read: true,
      })
      .select("*")
      .single();

    if (insertErr) throw insertErr;

    // 2. 更新客户最后消息（不阻塞响应）
    void supabase
      .from("customers")
      .update({
        last_message_preview: content.slice(0, 100),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    // 3. 取最近历史 + 生成 AI 回复（在返回前 await，避免 Vercel 杀掉后台任务）
    let aiMessage: Record<string, unknown> | null = null;

    try {
      const { data: recentMsgs } = await supabase
        .from("messages")
        .select("sender_type, content")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(13);

      const history = (recentMsgs || [])
        .reverse()
        .filter((m) => m.sender_type === "customer" || m.sender_type === "ai")
        .slice(-12)
        .map((m) => ({
          role: (m.sender_type === "customer" ? "user" : "assistant") as "user" | "assistant",
          content: m.content || "",
        }));

      const aiResult = await generateAIReply(content, history);

      const { data: aiMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          customer_id: customerId,
          sender_type: "ai",
          sender_name: "小艾",
          message_type: "text",
          content: aiResult.content,
          ai_confidence: Math.round(aiResult.confidence * 100),
          ai_source: aiResult.source,
          is_read: false,
        })
        .select("*")
        .single();

      if (aiMsg) aiMessage = aiMsg;

      // 标签提取（失败不影响主流程）
      try {
        const tags = extractTagsFromMessage(content);
        for (const tag of tags) {
          const confInt = Math.round(tag.confidence * 100);
          const { data: existing } = await supabase
            .from("customer_tags")
            .select("confidence")
            .eq("customer_id", customerId)
            .eq("tag_type", tag.tag_type)
            .maybeSingle();
          if (!existing || (existing.confidence || 0) < confInt) {
            await supabase
              .from("customer_tags")
              .upsert(
                {
                  customer_id: customerId,
                  tag_type: tag.tag_type,
                  tag_value: tag.tag_value,
                  confidence: confInt,
                  source: "ai",
                },
                { onConflict: "customer_id,tag_type" }
              );
          }
        }

        const intentTag = tags.find((t) => t.tag_type === "intent_level");
        if (intentTag?.tag_value) {
          const level = intentTag.tag_value as "S" | "A" | "B";
          const rank: Record<string, number> = { S: 3, A: 2, B: 1 };
          const { data: cust } = await supabase
            .from("customers")
            .select("intent_level")
            .eq("id", customerId)
            .maybeSingle();
          const currentRank = rank[cust?.intent_level || "B"] || 1;
          const newRank = rank[level] || 1;
          if (newRank > currentRank) {
            await supabase.from("customers").update({ intent_level: level }).eq("id", customerId);
          }
        }
      } catch (tagErr) {
        console.warn("[widget/send] tag extraction failed:", tagErr);
      }
    } catch (aiErr) {
      console.error("[widget/send] AI reply failed:", aiErr);
      // AI 失败不报错给前端，客户消息已成功插入
    }

    return NextResponse.json({ success: true, message: msg, aiMessage });
  } catch (error) {
    console.error("[widget/send] 发送失败:", error);
    const msg = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
