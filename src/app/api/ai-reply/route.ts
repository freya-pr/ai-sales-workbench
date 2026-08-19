import { NextRequest, NextResponse } from "next/server";
import { generateAIReply, extractTagsFromMessage } from "@/lib/ai-reply";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface RequestBody {
  conversationId: string;
  customerId: string;
  message: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RequestBody;
    const { conversationId, customerId, message, history = [] } = body;

    if (!conversationId || !customerId || !message?.trim()) {
      return NextResponse.json(
        { error: "缺少必要参数 conversationId/customerId/message" },
        { status: 400 }
      );
    }

    // 1. 生成 AI 回复
    const reply = await generateAIReply(message.trim(), history);

    // 2. 写入数据库（使用 service_role 客户端绕过 RLS）
    let savedReplyId: string | null = null;
    try {
      const supabase = getSupabaseClient();

      // 插入 AI 回复
      const { data: msgData, error: msgErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          customer_id: customerId,
          sender_type: "ai",
          sender_name: "小艾",
          message_type: "text",
          content: reply.content,
          ai_confidence: Math.round(reply.confidence * 100),
          ai_source: reply.source,
          is_read: false,
        })
        .select("id")
        .single();

      if (msgErr) {
        console.error("[AI Reply] 写入消息失败:", msgErr);
      } else {
        savedReplyId = msgData.id;
      }

      // 3. 提取并更新标签（异步，不阻塞响应）
      const extractedTags = extractTagsFromMessage(message);
      if (extractedTags.length > 0) {
        for (const tag of extractedTags) {
          // 检查是否已有同类型标签
          const { data: existing } = await supabase
            .from("customer_tags")
            .select("id, confidence")
            .eq("customer_id", customerId)
            .eq("tag_type", tag.tag_type)
            .maybeSingle();

          if (existing) {
            // 只在新置信度更高时更新
            if (tag.confidence * 100 > (existing.confidence || 0)) {
              await supabase
                .from("customer_tags")
                .update({
                  tag_value: tag.tag_value,
                  confidence: Math.round(tag.confidence * 100),
                  source: "ai_extract",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);
            }
          } else {
            await supabase.from("customer_tags").insert({
              customer_id: customerId,
              tag_type: tag.tag_type,
              tag_value: tag.tag_value,
              confidence: Math.round(tag.confidence * 100),
              source: "ai_extract",
            });
          }
        }

        // 如果识别到更高意向度，更新客户表
        const intentTag = extractedTags.find((t) => t.tag_type === "intent_level");
        if (intentTag) {
          const levelRank: Record<string, number> = { B: 1, A: 2, S: 3 };
          const { data: cust } = await supabase
            .from("customers")
            .select("intent_level, urgency")
            .eq("id", customerId)
            .maybeSingle();

          if (cust) {
            const currentRank = levelRank[cust.intent_level] || 0;
            const newRank = levelRank[intentTag.tag_value] || 0;
            const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
            if (newRank > currentRank) {
              updateData.intent_level = intentTag.tag_value;
            }
            const urgencyTag = extractedTags.find((t) => t.tag_type === "urgency");
            if (urgencyTag?.tag_value === "高") {
              updateData.urgency = 5;
            }
            if (Object.keys(updateData).length > 1) {
              await supabase.from("customers").update(updateData).eq("id", customerId);
            }
          }
        }
      }
    } catch (dbErr) {
      console.error("[AI Reply] 数据库操作失败:", dbErr);
      // 即使写库失败也返回内容给客户端，避免客户看到错误
    }

    return NextResponse.json({
      success: true,
      reply: reply.content,
      messageId: savedReplyId,
      confidence: reply.confidence,
      source: reply.source,
    });
  } catch (err) {
    console.error("[AI Reply] 处理失败:", err);
    return NextResponse.json(
      { error: "AI 回复生成失败", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
