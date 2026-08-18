import { NextRequest, NextResponse } from "next/server";
import { getWeComAccessToken, weComFetch } from "@/lib/wecom/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/wecom/follow-users
 * 获取配置了客户联系功能的成员列表
 */
export async function GET(_req: NextRequest) {
  try {
    const accessToken = await getWeComAccessToken();
    const res = await weComFetch(
      `https://qyapi.weixin.qq.com/cgi-bin/externalcontact/get_follow_user_list?access_token=${accessToken}`
    );

    if (res.errcode !== 0) {
      return NextResponse.json(
        { success: false, error: res.errmsg, code: res.errcode },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      followUsers: res.follow_user || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "服务器错误" },
      { status: 500 }
    );
  }
}
