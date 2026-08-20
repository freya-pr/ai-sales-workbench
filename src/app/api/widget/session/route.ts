import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/storage/database/supabase-client";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

interface WidgetMessage {
  id: string;
  sender_type: string;
  sender_name: string | null;
  content: string | null;
  message_type: string;
  image_url: string | null;
  ai_confidence: number | null;
  ai_source: string | null;
  is_read: boolean | null;
  created_at: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { visitorId, name, phone, ref } = body;

    if (!visitorId) {
      return NextResponse.json({ error: "visitorId is required" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // 1. 查找或创建客户（service_role 绕过 RLS）
    let customer: { id: string; name: string; phone: string | null } | null = null;

    if (phone) {
      const { data } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("phone", phone)
        .maybeSingle();
      if (data) customer = data;
    }

    if (!customer) {
      const { data } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("wechat_id", visitorId)
        .maybeSingle();
      if (data) customer = data;
    }

    let customerId: string;
    let customerName: string;

    if (customer) {
      customerId = customer.id;
      customerName = customer.name;
      // 更新信息
      const updates: Record<string, string> = {};
      if (name && (!customer.name || customer.name.startsWith("访客"))) {
        updates.name = name;
        customerName = name;
      }
      if (phone && !customer.phone) updates.phone = phone;
      if (Object.keys(updates).length > 0) {
        await supabase.from("customers").update(updates).eq("id", customerId);
      }
    } else {
      customerName = name || `访客${visitorId.slice(-4)}`;
      const { data: newCust, error: custErr } = await supabase
        .from("customers")
        .insert({
          name: customerName,
          phone: phone || null,
          wechat_id: visitorId,
          source: ref || "widget",
          intent_level: "B",
          follow_up_status: "pending",
          ai_mode: true,
          unread_count: 0,
          urgency: 2,
          last_message_preview: "访客进入咨询",
        })
        .select("id, name")
        .single();
      if (custErr) throw custErr;
      if (!newCust) throw new Error("创建客户失败");
      customerId = newCust.id;
      customerName = newCust.name || customerName;
    }

    // 2. 查找或创建活跃会话
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .eq("customer_id", customerId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    let conversationId: string;
    let isNewConversation = false;

    if (convs && convs.length > 0) {
      conversationId = convs[0].id;
    } else {
      const { data: newConv, error: convErr } = await supabase
        .from("conversations")
        .insert({
          customer_id: customerId,
          status: "active",
          title: "在线咨询",
          ai_participation: "full",
        })
        .select("id")
        .single();
      if (convErr) throw convErr;
      if (!newConv) throw new Error("创建会话失败");
      conversationId = newConv.id;
      isNewConversation = true;
    }

    // 3. 加载历史消息
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100);

    let messages: WidgetMessage[] = msgs || [];

    // 4. 新会话插入欢迎语
    if (messages.length === 0 && isNewConversation) {
      const welcomeText = customerName && !customerName.startsWith("访客")
        ? `您好，${customerName}！😊 我是课程顾问小艾，很高兴为您服务。\n\n我可以帮您：\n• 了解 0-18 岁课程安排\n• 预约 liu 老师体验课（99元3节）\n• 查询价格和上课时间\n\n请问有什么可以帮您的？`
        : `您好呀~我是课程顾问小艾 😊\n\n我可以帮您：\n• 了解 0-18 岁课程安排\n• 预约 liu 老师体验课（99元3节）\n• 查询价格和上课时间\n\n请问有什么可以帮您的？`;

      const { data: welcomeMsg, error: welcomeErr } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          customer_id: customerId,
          sender_type: "ai",
          sender_name: "小艾",
          message_type: "text",
          content: welcomeText,
          ai_confidence: 100,
          ai_source: "welcome",
          is_read: true,
        })
        .select("*")
        .single();

      if (!welcomeErr && welcomeMsg) {
        messages = [welcomeMsg as WidgetMessage];
      }
    }

    return NextResponse.json({
      customerId,
      customerName,
      conversationId,
      isNewConversation,
      messages,
    });
  } catch (error) {
    console.error("[widget/session] 初始化失败:", error);
    const msg = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
