import { createClient } from "@supabase/supabase-js";

/**
 * 企业微信配置 - 从环境变量读取
 */
export const WECOM_CONFIG = {
  corpId: process.env.WECOM_CORP_ID || "",
  agentId: process.env.WECOM_AGENT_ID || "",
  secret: process.env.WECOM_SECRET || "",
  token: process.env.WECOM_TOKEN || "",
  encodingAESKey: process.env.WECOM_ENCODING_AES_KEY || "",
};

let tokenCache: { accessToken: string; expiresAt: number } | null = null;

/**
 * 获取 access_token（带缓存，提前5分钟刷新）
 */
export async function getWeComAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 300000) {
    return tokenCache.accessToken;
  }

  const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${WECOM_CONFIG.corpId}&corpsecret=${WECOM_CONFIG.secret}`;
  const resp = await fetch(url);
  const data = await resp.json();

  if (data.errcode !== 0) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/** 兼容旧命名 */
export const getAccessToken = getWeComAccessToken;

/**
 * 企业微信 API 请求封装
 */
export async function weComFetch(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const resp = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  return resp.json();
}

/**
 * 发送文本消息到企业微信
 */
export async function sendTextMessage(
  toUser: string,
  content: string
): Promise<void> {
  const accessToken = await getAccessToken();
  const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`;

  const body = {
    touser: toUser,
    msgtype: "text",
    agentid: Number(WECOM_CONFIG.agentId),
    text: { content },
    safe: 0,
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (data.errcode !== 0) {
    throw new Error(`发送消息失败: ${data.errmsg}`);
  }
}

/**
 * 初始化服务端 Supabase 客户端
 */
export function getSupabaseAdmin() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.COZE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase 环境变量未配置");
  }

  return createClient(url, key);
}
