import { NextRequest, NextResponse } from "next/server";
import { WECOM_CONFIG, getSupabaseAdmin } from "@/lib/wecom/client";
import {
  verifySignature,
  decrypt,
  buildEncryptedReply,
} from "@/lib/wecom/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WeComMessage {
  ToUserName: string;
  FromUserName: string;
  CreateTime: string;
  MsgType: string;
  Content?: string;
  MsgId?: string;
  AgentID?: string;
}

function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)><!\[CDATA\[([\s\S]*?)\]\]><\/\1>|<(\w+)>([\s\S]*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    if (key) result[key] = value;
  }
  return result;
}

/**
 * GET - 企业微信回调URL验证
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const msgSignature = searchParams.get("msg_signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";

  if (!echostr) {
    return NextResponse.json(
      { error: "缺少 echostr 参数" },
      { status: 400 }
    );
  }

  const config = {
    token: WECOM_CONFIG.token,
    encodingAESKey: WECOM_CONFIG.encodingAESKey,
    corpId: WECOM_CONFIG.corpId,
  };

  if (!verifySignature(config, msgSignature, timestamp, nonce, echostr)) {
    return NextResponse.json({ error: "签名验证失败" }, { status: 403 });
  }

  try {
    const { message } = decrypt(config, echostr);
    return new NextResponse(message, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (err) {
    console.error("解密 echostr 失败:", err);
    return NextResponse.json(
      { error: "解密失败" },
      { status: 500 }
    );
  }
}

/**
 * POST - 接收企业微信消息
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const msgSignature = searchParams.get("msg_signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";

  const body = await req.text();
  const xmlData = parseXml(body);
  const encrypted = xmlData.Encrypt;

  if (!encrypted) {
    return NextResponse.json({ error: "缺少 Encrypt 字段" }, { status: 400 });
  }

  const config = {
    token: WECOM_CONFIG.token,
    encodingAESKey: WECOM_CONFIG.encodingAESKey,
    corpId: WECOM_CONFIG.corpId,
  };

  if (!verifySignature(config, msgSignature, timestamp, nonce, encrypted)) {
    return NextResponse.json({ error: "签名验证失败" }, { status: 403 });
  }

  let message: WeComMessage;
  try {
    const { message: decryptedXml } = decrypt(config, encrypted);
    const parsed = parseXml(decryptedXml);
    message = {
      ToUserName: parsed.ToUserName || "",
      FromUserName: parsed.FromUserName || "",
      CreateTime: parsed.CreateTime || "",
      MsgType: parsed.MsgType || "",
      Content: parsed.Content,
      MsgId: parsed.MsgId,
      AgentID: parsed.AgentID,
    };
  } catch (err) {
    console.error("解密消息失败:", err);
    return NextResponse.json({ error: "解密失败" }, { status: 500 });
  }

  console.log("收到企业微信消息:", message);

  // 处理文本消息：存入 Supabase
  if (message.MsgType === "text" && message.Content) {
    try {
      const supabase = getSupabaseAdmin();
      const wecomUserId = message.FromUserName;

      // 查找或创建客户
      let { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("wechat_id", wecomUserId)
        .eq("source", "wechat")
        .single();

      if (!customer) {
        const { data: newCustomer, error: insertErr } = await supabase
          .from("customers")
          .insert({
            name: `微信用户_${wecomUserId.slice(-6)}`,
            wechat_id: wecomUserId,
            source: "wechat",
            intent_level: "B",
            follow_up_status: "pending",
            ai_mode: true,
            unread_count: 0,
            last_message_preview: message.Content,
            urgency: 2,
          })
          .select("id")
          .single();

        if (insertErr) {
          console.error("创建客户失败:", insertErr);
        }
        customer = newCustomer;
      }

      if (customer) {
        // 查找或创建会话
        let { data: conversation } = await supabase
          .from("conversations")
          .select("id")
          .eq("customer_id", customer.id)
          .eq("status", "active")
          .single();

        if (!conversation) {
          const { data: newConv, error: convErr } = await supabase
            .from("conversations")
            .insert({
              customer_id: customer.id,
              status: "active",
              title: `微信对话_${wecomUserId.slice(-6)}`,
              ai_participation: "full",
            })
            .select("id")
            .single();

          if (convErr) {
            console.error("创建会话失败:", convErr);
          }
          conversation = newConv;
        }

        if (conversation) {
          // 插入消息
          await supabase.from("messages").insert({
            conversation_id: conversation.id,
            customer_id: customer.id,
            sender_type: "customer",
            message_type: "text",
            content: message.Content,
            is_read: false,
          });

          // 更新客户最后消息
          await supabase
            .from("customers")
            .update({
              last_message_preview: message.Content,
              last_message_at: new Date().toISOString(),
              unread_count: 1,
            })
            .eq("id", customer.id);
        }
      }
    } catch (err) {
      console.error("处理消息入库失败:", err);
    }
  }

  // 返回空响应（企业微信要求5秒内返回，否则重试）
  return new NextResponse("success", { status: 200 });
}
