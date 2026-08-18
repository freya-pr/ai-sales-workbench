import { NextRequest, NextResponse } from "next/server";
import { getWeComAccessToken, weComFetch } from "@/lib/wecom/client";

export const dynamic = "force-dynamic";

interface SendRequestBody {
  toUser: string;       // 企业微信外部联系人ID（客户的 external_userid）
  content: string;      // 文本消息内容
  senderUserId?: string; // 发送者的企业微信UserID（可选，默认从环境变量取）
}

/**
 * POST /api/wecom/send-text
 * 通过企业微信 API 发送文本消息给客户
 *
 * 注意：企业微信发送应用消息只能发给企业成员，发给外部联系人需要用
 * "发送新客户消息" 接口（需配置客户联系功能）
 *
 * 此接口使用「发送新客户消息」接口：
 * POST https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_msg_template
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SendRequestBody;

    if (!body.toUser || !body.content) {
      return NextResponse.json(
        { success: false, error: "缺少必要参数：toUser, content" },
        { status: 400 }
      );
    }

    const accessToken = await getWeComAccessToken();
    const sender = body.senderUserId || process.env.WECOM_DEFAULT_SENDER_USERID;

    // 使用「发送新客户消息」接口
    // 文档：https://developer.work.weixin.qq.com/document/path/92135
    const msgPayload = {
      chat_type: "single", // single-单聊 group-群聊
      external_userid: [body.toUser], // 外部联系人ID列表
      sender: sender || undefined, // 发送者企业成员ID（如果不填则由应用发送）
      text: {
        content: body.content,
      },
      attachments: [] as unknown[],
    };

    const res = await weComFetch(
      `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/add_msg_template?access_token=${accessToken}`,
      {
        method: "POST",
        body: JSON.stringify(msgPayload),
      }
    );

    if (res.errcode !== 0) {
      console.error("WeCom send message failed:", res);
      return NextResponse.json(
        {
          success: false,
          error: res.errmsg || "发送失败",
          code: res.errcode,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      msgid: res.msgid,
      fail_list: res.fail_list || [],
    });
  } catch (error) {
    console.error("WeCom send-text API error:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
