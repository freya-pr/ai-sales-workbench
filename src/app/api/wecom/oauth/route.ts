import { NextRequest, NextResponse } from "next/server";
import { getWeComAccessToken, weComFetch } from "@/lib/wecom/client";

export const dynamic = "force-dynamic";

/**
 * 企业微信 OAuth 回调
 * 用户在企业微信内打开应用 → 重定向到企业微信授权 → 带 code 回到此接口
 * 此接口用 code 换取用户身份，生成 session token，重定向到首页
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "/";

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${url.protocol}//${url.host}`;

  if (!code) {
    // 没有 code，重定向到企业微信 OAuth 授权页
    const corpId = process.env.WECOM_CORP_ID!;
    const agentId = process.env.WECOM_AGENT_ID!;
    const redirectUri = encodeURIComponent(
      `${appUrl}/api/wecom/oauth?state=${encodeURIComponent(state)}`
    );
    const oauthUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_base&agentid=${agentId}#wechat_redirect`;
    return NextResponse.redirect(oauthUrl);
  }

  try {
    // 用 code 换取用户信息
    const accessToken = await getWeComAccessToken();
    const userRes = await weComFetch(
      `https://qyapi.weixin.qq.com/cgi-bin/user/getuserinfo?access_token=${accessToken}&code=${code}`
    );

    if (userRes.errcode !== 0) {
      console.error("WeCom OAuth getuserinfo failed:", userRes);
      return NextResponse.redirect(`${appUrl}/login?error=oauth_failed`);
    }

    // userRes.UserId 是企业微信用户ID（企业成员）
    // userRes.OpenId 是外部联系人ID（非企业成员）
    const userId = userRes.UserId;
    if (!userId) {
      return NextResponse.redirect(`${appUrl}/login?error=not_member`);
    }

    // 获取用户详细信息
    const userDetail = await weComFetch(
      `https://qyapi.weixin.qq.com/cgi-bin/user/get?access_token=${accessToken}&userid=${userId}`
    );

    // 生成简单的 session token（生产环境应使用 JWT）
    const sessionData = {
      userId: userId,
      name: userDetail.name || userId,
      avatar: userDetail.avatar || "",
      email: userDetail.email || "",
      department: userDetail.department || [],
      loginAt: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    // 重定向到首页，设置 cookie
    const redirectUrl = new URL(state.startsWith("/") ? state : "/", appUrl);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("wecom_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: "/",
    });
    return response;
  } catch (error) {
    console.error("WeCom OAuth error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=server_error`);
  }
}
