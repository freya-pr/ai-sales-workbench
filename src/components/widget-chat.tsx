"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Send, Loader2, Bot, User, Sparkles, Phone, BadgeCheck, X, MessageCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SupabaseConfigProvider, useSupabaseConfig } from "@/lib/supabase-config-inject";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface WidgetChatProps {
  /** 嵌入模式：inline 嵌入到页面布局；floating 悬浮按钮；fullscreen 全屏 */
  mode?: "inline" | "floating" | "fullscreen";
  /** URL 参数预填 */
  defaultName?: string;
  defaultPhone?: string;
  source?: string;
  title?: string;
  primaryColor?: string;
}

interface WidgetMessage {
  id: string;
  conversation_id?: string;
  customer_id?: string;
  sender_type: string;
  sender_name: string | null;
  content: string | null;
  message_type: string;
  image_url: string | null;
  ai_confidence?: number | null;
  ai_source?: string | null;
  is_read?: boolean | null;
  created_at: string;
}

interface UrlParams {
  name?: string;
  phone?: string;
  ref?: string;
  title?: string;
  color?: string;
  auto?: string;
}

function parseUrlParams(): UrlParams {
  if (typeof window === "undefined") return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    name: sp.get("name") || undefined,
    phone: sp.get("phone") || undefined,
    ref: sp.get("ref") || undefined,
    title: sp.get("title") || undefined,
    color: sp.get("color") || undefined,
    auto: sp.get("auto") || undefined,
  };
}

export function WidgetChat({
  mode = "floating",
  defaultName,
  defaultPhone,
  source,
  title: titleProp,
  primaryColor: colorProp,
}: WidgetChatProps) {
  const { config, isLoading: configLoading, error: configError } = useSupabaseConfig();
  const urlParams = useMemo(() => parseUrlParams(), []);
  const isEmbedded = mode === "inline" || mode === "fullscreen";
  const headerTitle = titleProp || urlParams.title || "课程顾问";
  const primaryColor = colorProp || urlParams.color || "#0891b2";

  // 合并 props 和 URL 参数（props 优先）
  const params = {
    name: defaultName || urlParams.name,
    phone: defaultPhone || urlParams.phone,
    ref: source || urlParams.ref || "widget",
  };

  const apiBase = useMemo(() => {
    if (typeof window === "undefined") return "";
    const host = window.location.hostname;
    if (host.includes("github.io") || host.includes("coze.site")) {
      return "https://ai-sales-workbench-liart.vercel.app";
    }
    return window.location.origin;
  }, []);

  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(mode === "inline" || mode === "fullscreen");
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [customerName, setCustomerName] = useState<string>(defaultName || urlParams.name || "");
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState(defaultName || urlParams.name || "");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 访客ID生成（跨会话保留）
  const getOrCreateVisitorId = useCallback(() => {
    let vid = localStorage.getItem("widget_visitor_id");
    if (!vid) {
      vid = "v_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem("widget_visitor_id", vid);
    }
    return vid;
  }, []);

  // 初始化 Supabase 客户端
  useEffect(() => {
    if (config) {
      if (typeof window !== "undefined") {
        window.__SUPABASE_CONFIG__ = { url: config.url, anonKey: config.anonKey };
      }
      try {
        supabaseRef.current = getSupabaseBrowserClient();
      } catch (e) {
        console.error("Supabase init failed:", e);
        setInitError("无法连接到服务器，请稍后重试");
        setIsLoading(false);
      }
    }
  }, [config]);

  // 加载或创建会话
  useEffect(() => {
    if (!supabaseRef.current) return;
    const supabase = supabaseRef.current;
    const visitorId = getOrCreateVisitorId();
    let cancelled = false;
    // 15秒超时保护，避免网络/权限异常时永远 loading
    const timeoutTimer = setTimeout(() => {
      if (!cancelled) {
        console.error("初始化超时");
        setInitError("连接超时，请检查网络后重试");
        setIsLoading(false);
      }
    }, 15000);

    (async () => {
      try {
        console.log("[WidgetChat] 开始初始化...");
        // 先做一次轻量探活，快速暴露网络/RLS 问题
        const probe = await supabase.from("customers").select("id").limit(1);
        if (probe.error) {
          throw new Error(`数据库访问失败: ${probe.error.message}`);
        }
        console.log("[WidgetChat] 数据库探活成功");

        // 若 URL 带了 phone，优先按 phone 查
        let existingCust: { id: string; name: string; phone: string | null; wechat_id: string | null } | null = null;
        if (params.phone) {
          const r = await supabase
            .from("customers")
            .select("id, name, phone, wechat_id")
            .eq("phone", params.phone)
            .maybeSingle();
          if (r.data) existingCust = r.data;
        }
        // 再按 visitorId 查
        if (!existingCust) {
          const r = await supabase
            .from("customers")
            .select("id, name, phone, wechat_id")
            .eq("wechat_id", visitorId)
            .maybeSingle();
          if (r.data) existingCust = r.data;
        }

        let custId: string;
        let custName: string = "";
        if (existingCust) {
          custId = existingCust.id;
          custName = existingCust.name || "";
          // 若 URL 带了 name 且库里还是"访客xxx"，更新一下
          if (params.name && (!custName || custName.startsWith("访客"))) {
            await supabase.from("customers").update({ name: params.name }).eq("id", custId);
            custName = params.name;
          }
          // 若 URL 带了 phone 但库里没 phone，补上
          if (params.phone && !existingCust.phone) {
            await supabase.from("customers").update({ phone: params.phone }).eq("id", custId);
          }
        } else {
          custName = params.name || `访客${visitorId.slice(-4)}`;
          const { data: newCust, error: custErr } = await supabase
            .from("customers")
            .insert({
              name: custName,
              phone: params.phone || null,
              wechat_id: visitorId,
              source: params.ref || "widget",
              intent_level: "B",
              follow_up_status: "pending",
              ai_mode: true,
              unread_count: 0,
              urgency: 2,
              last_message_preview: "访客进入咨询",
            })
            .select("id, name")
            .single();
          if (custErr) throw new Error(`创建客户失败: ${custErr.message} (${custErr.code})`);
          if (!newCust) throw new Error("创建客户返回空数据");
          custId = newCust.id;
          custName = newCust.name || custName;
        }

        if (cancelled) return;
        console.log("[WidgetChat] 客户就绪:", custId, custName);
        setCustomerId(custId);
        setCustomerName(custName);
        if (!params.name && custName && custName.startsWith("访客")) {
          setShowNamePrompt(true);
        }

        // 查找活跃会话
        const { data: convs, error: convListErr } = await supabase
          .from("conversations")
          .select("id")
          .eq("customer_id", custId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1);
        if (convListErr) throw new Error(`查询会话失败: ${convListErr.message}`);

        let convId: string;
        let isNewConversation = false;
        if (convs && convs.length > 0) {
          convId = convs[0].id;
        } else {
          const { data: newConv, error: convErr } = await supabase
            .from("conversations")
            .insert({
              customer_id: custId,
              status: "active",
              title: "在线咨询",
              ai_participation: "full",
            })
            .select("id")
            .single();
          if (convErr) throw new Error(`创建会话失败: ${convErr.message} (${convErr.code})`);
          if (!newConv) throw new Error("创建会话返回空数据");
          convId = newConv.id;
          isNewConversation = true;
        }
        if (cancelled) return;
        console.log("[WidgetChat] 会话就绪:", convId, isNewConversation ? "(新)" : "(已有)");
        setConversationId(convId);

        // 加载历史消息
        const { data: msgs, error: msgErr } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })
          .limit(100);
        if (msgErr) throw new Error(`加载消息失败: ${msgErr.message}`);
        if (cancelled) return;
        const msgList = msgs || [];
        setMessages(msgList);
        setUnreadCount(msgList.filter((m) => m.sender_type !== "customer" && !m.is_read).length);
        console.log("[WidgetChat] 历史消息:", msgList.length, "条");

          // 如果是新会话且没有任何历史消息，插入欢迎语
          if (msgList.length === 0 && isNewConversation) {
            const welcomeText = custName && !custName.startsWith("访客")
              ? `您好，${custName}！😊 我是课程顾问小艾，很高兴为您服务。\n\n我可以帮您：\n• 了解3-6岁学龄前课程\n• 预约免费学情测评\n• 查询课程价格和时间\n\n请问有什么可以帮您的？`
              : `您好呀~我是课程顾问小艾 😊\n\n我可以帮您：\n• 了解3-6岁学龄前课程\n• 预约免费学情测评\n• 查询课程价格和时间\n\n请问有什么可以帮您的？`;
            const { error: welcomeErr } = await supabase.from("messages").insert({
              conversation_id: convId,
              customer_id: custId,
              sender_type: "ai",
              sender_name: "小艾",
              message_type: "text",
              content: welcomeText,
              ai_confidence: 100,
              ai_source: "welcome",
              is_read: true,
            });
            if (welcomeErr) {
              console.error("欢迎语插入失败(非致命):", welcomeErr);
            } else {
              setMessages([
                {
                  id: "welcome-local",
                  conversation_id: convId,
                  customer_id: custId,
                  sender_type: "ai",
                  sender_name: "小艾",
                  message_type: "text",
                  content: welcomeText,
                  image_url: null,
                  ai_confidence: 100,
                  ai_source: "welcome",
                  is_read: true,
                  created_at: new Date().toISOString(),
                } as WidgetMessage,
              ]);
            }
          }
        console.log("[WidgetChat] 初始化完成");
        clearTimeout(timeoutTimer);
        setIsLoading(false);
      } catch (err) {
        console.error("[WidgetChat] 初始化失败:", err);
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : "未知错误";
          setInitError(`连接失败：${msg}。请刷新页面重试`);
          clearTimeout(timeoutTimer);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeoutTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseRef.current]);

  // 实时订阅
  useEffect(() => {
    if (!supabaseRef.current || !conversationId) return;
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel(`widget_msgs_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as WidgetMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_type !== "customer" && !isOpen) {
            setUnreadCount((c) => c + 1);
          }
          if (isOpen && newMsg.sender_type !== "customer") {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMsg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, isOpen]);

  useEffect(() => {
    if (isOpen && unreadCount > 0 && supabaseRef.current && conversationId) {
      setUnreadCount(0);
      supabaseRef.current
        .from("messages")
        .update({ is_read: true })
        .eq("conversation_id", conversationId)
        .eq("is_read", false)
        .neq("sender_type", "customer")
        .then();
    }
  }, [isOpen, unreadCount, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen, showNamePrompt]);

  // 监听父窗口
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CHAT_WIDGET_OPEN") setIsOpen(true);
      else if (e.data?.type === "CHAT_WIDGET_CLOSE") setIsOpen(false);
    };
    window.addEventListener("message", handler);
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CHAT_WIDGET_READY" }, "*");
    }
    return () => window.removeEventListener("message", handler);
  }, []);

  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CHAT_WIDGET_CLOSE" }, "*");
    } else {
      setIsOpen(false);
    }
  };

  const saveNameAndClose = async () => {
    const name = nameInput.trim();
    if (!name || !customerId || !supabaseRef.current) {
      setShowNamePrompt(false);
      return;
    }
    try {
      await supabaseRef.current.from("customers").update({ name }).eq("id", customerId);
      setCustomerName(name);
    } catch (e) {
      console.error(e);
    }
    setShowNamePrompt(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending || !supabaseRef.current || !conversationId || !customerId) return;

    setIsSending(true);
    setInput("");
    try {
      // 1. 客户消息写入数据库
      const { error } = await supabaseRef.current.from("messages").insert({
        conversation_id: conversationId,
        customer_id: customerId,
        sender_type: "customer",
        sender_name: customerName || null,
        message_type: "text",
        content: text,
        is_read: true,
      });
      if (error) throw error;

      // 2. 更新客户最后消息
      await supabaseRef.current
        .from("customers")
        .update({
          last_message_preview: text.slice(0, 100),
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);

      // 3. 调用后端 AI 自动回复（AI 消息由后端写入，前端通过 Realtime 接收）
      const recentHistory = messages
        .filter((m) => m.sender_type === "customer" || m.sender_type === "ai")
        .slice(-6)
        .map((m) => ({
          role: (m.sender_type === "customer" ? "user" : "assistant") as "user" | "assistant",
          content: m.content || "",
        }));

      fetch(`${apiBase}/api/ai-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          customerId,
          message: text,
          history: recentHistory,
        }),
      }).catch((err) => {
        console.error("AI 回复请求失败:", err);
      });
    } catch (err) {
      console.error("发送失败:", err);
      setInput(text);
      alert("发送失败，请检查网络后重试");
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  const quickReplies = ["课程价格多少？", "适合几岁孩子？", "可以试听吗？", "上课时间怎么安排？"];

  // ----- 渲染 -----
  if (configError || initError) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-xs">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X className="h-6 w-6" />
          </div>
          <p className="text-sm text-slate-700">{initError || configError || "加载失败"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-cyan-600 px-4 py-2 text-sm text-white hover:bg-cyan-700"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const containerClass =
    mode === "inline"
      ? "flex h-full w-full flex-col bg-white"
      : mode === "fullscreen"
        ? "flex h-screen w-screen flex-col bg-white"
        : "fixed bottom-0 right-0 z-50 flex flex-col items-end gap-3 p-4 sm:p-6";

  const windowVisible = isOpen || isEmbedded;
  const chatWindowHeight = mode === "inline" ? "100%" : mode === "fullscreen" ? "100%" : "min(600px, 80vh)";
  const chatWindowWidth =
    mode === "inline"
      ? "100%"
      : mode === "fullscreen"
        ? "100%"
        : "w-[calc(100vw-1.5rem)] max-w-[400px]";

  return (
    <div
      className={containerClass}
      style={isEmbedded ? undefined : { pointerEvents: "none" }}
    >
      {windowVisible && (
        <div
          className={`flex ${chatWindowWidth} flex-col overflow-hidden bg-white ring-1 ring-black/5 ${mode === "floating" ? "rounded-2xl shadow-2xl" : "rounded-none"}`}
          style={{
            height: chatWindowHeight,
            animation: mode === "floating" ? "slideUp 0.3s ease" : undefined,
            pointerEvents: "auto",
          }}
        >
          {/* 头部 */}
          <div
            className="relative flex items-center gap-3 px-4 py-3.5 text-white"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, #14b8a6)` }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <span className="truncate">{headerTitle}</span>
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-white/90" />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/85">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                在线 · 通常1分钟内回复
              </div>
            </div>
            {mode === "floating" && (
              <button
                onClick={handleClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/20"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* 客户身份条 */}
          {customerName && !customerName.startsWith("访客") && (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-1.5 text-[11px] text-slate-500">
              <User className="h-3 w-3" />
              <span className="truncate">当前访客：{customerName}</span>
              {params.phone && (
                <>
                  <span className="text-slate-300">·</span>
                  <Phone className="h-3 w-3" />
                  <span>{params.phone}</span>
                </>
              )}
            </div>
          )}

          {/* 欢迎横幅 */}
          {messages.length === 0 && !isLoading && (
            <div className="border-b border-cyan-50 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3">
              <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" />
                <p>
                  您好{customerName && !customerName.startsWith("访客") ? `，${customerName}` : ""}！
                  我是AI课程顾问，可以帮您了解3-6岁学龄前教育课程、预约试听。有任何问题随时问我~
                </p>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="relative flex-1 overflow-y-auto bg-slate-50/50 px-4 py-4">
            {isLoading || configLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
                <p className="text-xs">正在连接客服...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((msg) => {
                  const isCustomer = msg.sender_type === "customer";
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isCustomer ? "flex-row-reverse" : ""}`}
                    >
                      {!isCustomer && (
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                          style={{ background: `linear-gradient(135deg, ${primaryColor}, #14b8a6)` }}
                        >
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isCustomer
                            ? "rounded-br-md text-white"
                            : msg.sender_type === "ai"
                              ? "rounded-bl-md border border-violet-100 bg-white text-slate-800"
                              : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-100"
                        }`}
                        style={isCustomer ? { background: primaryColor } : undefined}
                      >
                        {msg.content}
                        <div
                          className={`mt-1 text-[10px] ${
                            isCustomer ? "text-white/60" : "text-slate-400"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                      {isCustomer && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* 姓名收集弹层 */}
            {showNamePrompt && !isLoading && (
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200">
                <p className="mb-2 text-xs font-medium text-slate-700">
                  方便告诉我们怎么称呼您吗？
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveNameAndClose()}
                    placeholder="您的称呼"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-cyan-400"
                    autoFocus
                  />
                  <button
                    onClick={saveNameAndClose}
                    className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-700"
                  >
                    确定
                  </button>
                  <button
                    onClick={() => setShowNamePrompt(false)}
                    className="rounded-lg px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                  >
                    跳过
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 快捷回复 */}
          {messages.length < 3 && !isLoading && !showNamePrompt && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3 pt-2">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="rounded-full border border-cyan-100 bg-cyan-50/50 px-2.5 py-1 text-[11px] text-cyan-700 transition hover:bg-cyan-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* 输入区 */}
          <div className="border-t border-slate-100 bg-white px-3 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200 focus-within:ring-cyan-400">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="输入您的问题..."
                disabled={isSending || isLoading || !!configError}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: primaryColor }}
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              由 AI 销售助手提供服务 · 工作时间 9:00-21:00
            </div>
          </div>
        </div>
      )}

      {/* 悬浮按钮（仅 floating 模式显示） */}
      {mode === "floating" && (
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setUnreadCount(0);
          }}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, #14b8a6)`,
            boxShadow: `0 10px 25px -5px ${primaryColor}55`,
            pointerEvents: "auto",
          }}
          aria-label="打开客服"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          {!isOpen && (
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-30"
              style={{ background: primaryColor }}
            />
          )}
        </button>
      )}
    </div>
  );
}

/** 带 SupabaseConfigProvider 的包装组件，直接在页面中使用 */
export function WidgetChatWithProvider(props: WidgetChatProps) {
  return (
    <SupabaseConfigProvider>
      <WidgetChat {...props} />
    </SupabaseConfigProvider>
  );
}
