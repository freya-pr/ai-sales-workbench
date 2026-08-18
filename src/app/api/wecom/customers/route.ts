import { NextRequest, NextResponse } from "next/server";
import { getWeComAccessToken, weComFetch } from "@/lib/wecom/client";

export const dynamic = "force-dynamic";

interface WeComExternalContact {
  external_userid: string;
  name: string;
  avatar: string;
  type: number; // 1-微信用户 2-企业微信用户
  gender: number; // 0未知 1男 2女
  unionid: string;
  position: string;
  corp_name: string;
  corp_full_name: string;
  external_profile?: {
    external_attr: Array<{
      type: number;
      name: string;
      text?: { value: string };
      web?: { title: string; url: string };
      miniprogram?: { title: string; appid: string; pagepath: string };
    }>;
  };
}

/**
 * GET /api/wecom/customers
 * 获取企业微信客户列表（外部联系人）
 * 支持分页：?cursor=xxx&limit=50
 */
export async function GET(req: NextRequest) {
  try {
    const accessToken = await getWeComAccessToken();
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor") || "";

    // 第一步：获取外部联系人ID列表
    const listRes = await weComFetch(
      `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/list?access_token=${accessToken}`,
      {
        method: "POST",
        body: JSON.stringify({
          cursor: cursor || undefined,
          limit: 50,
        }),
      }
    );

    if (listRes.errcode !== 0) {
      console.error("WeCom list external contacts failed:", listRes);
      return NextResponse.json(
        { success: false, error: listRes.errmsg || "获取客户列表失败", code: listRes.errcode },
        { status: 500 }
      );
    }

    const externalUserIds: string[] = listRes.external_userid || [];
    const nextCursor = listRes.next_cursor || "";

    // 第二步：批量获取客户详情
    const customers: WeComExternalContact[] = [];
    if (externalUserIds.length > 0) {
      // 企业微信批量接口每次最多100个
      const batchRes = await weComFetch(
        `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/batch/get_by_user?access_token=${accessToken}`,
        {
          method: "POST",
          body: JSON.stringify({
            userid_list: externalUserIds.slice(0, 100),
            cursor: "",
            limit: 100,
          }),
        }
      );

      if (batchRes.errcode === 0 && batchRes.external_contact_list) {
        for (const item of batchRes.external_contact_list) {
          if (item.external_contact) {
            customers.push(item.external_contact);
          }
        }
      }
    }

    // 格式化为前端需要的格式
    const formatted = customers.map((c) => ({
      id: c.external_userid,
      name: c.name,
      avatar: c.avatar,
      gender: c.gender === 1 ? "男" : c.gender === 2 ? "女" : "未知",
      type: c.type === 2 ? "企业微信用户" : "微信用户",
      position: c.position || "",
      company: c.corp_name || "",
      externalUserId: c.external_userid,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      nextCursor,
      total: formatted.length,
    });
  } catch (error) {
    console.error("WeCom customers API error:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
