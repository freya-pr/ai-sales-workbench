import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

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

    // 2. 更新客户最后消息
    await supabase
      .from("customers")
      .update({
        last_message_preview: content.slice(0, 100),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerId);

    // 3. 异步触发 AI 回复（不阻塞响应）
    // 构造最近历史
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

    // fire-and-forget 调用 AI 回复接口
    const apiBase = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5000";

    fetch(`${apiBase}/api/ai-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId,
        customerId,
        message: content,
        history,
      }),
    }).catch((err) => {
      console.error("[widget/send] AI 回复触发失败:", err);
    });

    return NextResponse.json({ success: true, message: msg });
  } catch (error) {
    console.error("[widget/send] 发送失败:", error);
    const msg = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
