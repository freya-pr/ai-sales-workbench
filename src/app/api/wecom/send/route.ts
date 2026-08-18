import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, sendTextMessage } from "@/lib/wecom/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/wecom/send
 * 从工作台回复企业微信客户消息
 * Body: { customerId: string, content: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerId, content } = body;

    if (!customerId || !content) {
      return NextResponse.json(
        { error: "缺少 customerId 或 content" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // 获取客户的企业微信用户ID
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, wechat_id, source, name")
      .eq("id", customerId)
      .single();

    if (custErr || !customer) {
      return NextResponse.json(
        { error: "客户不存在" },
        { status: 404 }
      );
    }

    if (customer.source !== "wechat" || !customer.wechat_id) {
      return NextResponse.json(
        { error: "该客户不是企业微信客户" },
        { status: 400 }
      );
    }

    // 发送消息到企业微信
    await sendTextMessage(customer.wechat_id, content);

    // 找到活跃会话
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .single();

    // 入库消息
    if (conversation) {
      await supabase.from("messages").insert({
        conversation_id: conversation.id,
        customer_id: customerId,
        sender_type: "sales",
        sender_name: "销售",
        message_type: "text",
        content,
        is_read: true,
      });

      await supabase
        .from("customers")
        .update({
          last_message_preview: content,
          last_message_at: new Date().toISOString(),
          unread_count: 0,
        })
        .eq("id", customerId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("发送企业微信消息失败:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "发送失败" },
      { status: 500 }
    );
  }
}
