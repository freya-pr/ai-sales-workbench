"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2, MessageCircle, X, Bot, User, Sparkles } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { SupabaseConfigProvider, useSupabaseConfig } from "@/lib/supabase-config-inject";
import type { SupabaseClient } from "@supabase/supabase-js";

interface WidgetMessage {
  id: string;
  sender_type: string;
  sender_name: string | null;
  content: string | null;
  message_type: string;
  image_url: string | null;
  created_at: string;
}

function WidgetChat() {
  const { config } = useSupabaseConfig();
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const [messages, setMessages] = useState<WidgetMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== "undefined" && window.parent !== window) {
      return true; // iframe 嵌入模式默认展开
    }
    return false;
  });
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取或创建访客ID
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
      supabaseRef.current = getSupabaseBrowserClient();
    }
  }, [config]);

  // 加载或创建会话
  useEffect(() => {
    if (!supabaseRef.current) return;
    const supabase = supabaseRef.current;
    const visitorId = getOrCreateVisitorId();

    (async () => {
      try {
        // 查找已有的访客客户记录
        const { data: existingCust } = await supabase
          .from("customers")
          .select("id, name")
          .eq("wechat_id", visitorId)
          .maybeSingle();

        let custId: string;
        if (existingCust) {
          custId = existingCust.id;
        } else {
          // 创建新的访客客户
          const { data: newCust, error: custErr } = await supabase
            .from("customers")
            .insert({
              name: `访客${visitorId.slice(-4)}`,
              wechat_id: visitorId,
              source: "widget",
              intent_level: "B",
              follow_up_status: "pending",
              ai_mode: true,
              unread_count: 0,
              urgency: 2,
              last_message_preview: "访客进入咨询",
            })
            .select("id")
            .single();
          if (custErr) throw custErr;
          custId = newCust.id;
        }
        setCustomerId(custId);

        // 查找活跃会话
        const { data: convs } = await supabase
          .from("conversations")
          .select("id")
          .eq("customer_id", custId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1);

        let convId: string;
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
          if (convErr) throw convErr;
          convId = newConv.id;
        }
        setConversationId(convId);

        // 加载历史消息
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", convId)
          .order("created_at", { ascending: true })
          .limit(50);
        if (msgs) {
          setMessages(msgs);
          setUnreadCount(msgs.filter((m) => m.sender_type !== "customer" && !m.is_read).length);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("初始化失败:", err);
        setIsLoading(false);
      }
    })();
  }, [supabaseRef.current]);

  // 实时订阅新消息
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
          setMessages((prev) => [...prev, newMsg]);
          // 如果不是客户发的且窗口未打开，增加未读数
          if (newMsg.sender_type !== "customer" && !isOpen) {
            setUnreadCount((c) => c + 1);
          }
          // 标记为已读
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

  // 打开时清除未读并标记已读
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
  }, [isOpen]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // 自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // 监听父窗口的 open/close 消息
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "CHAT_WIDGET_OPEN") {
        setIsOpen(true);
      } else if (e.data?.type === "CHAT_WIDGET_CLOSE") {
        setIsOpen(false);
      }
    };
    window.addEventListener("message", handler);
    // 通知父窗口已加载
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CHAT_WIDGET_READY" }, "*");
    }
    return () => window.removeEventListener("message", handler);
  }, []);

  // 在 iframe 嵌入模式下，点击关闭按钮通知父窗口
  const handleClose = () => {
    if (window.parent !== window) {
      window.parent.postMessage({ type: "CHAT_WIDGET_CLOSE" }, "*");
    } else {
      setIsOpen(false);
    }
  };

  // 发送消息
  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending || !supabaseRef.current || !conversationId || !customerId) return;

    setIsSending(true);
    setInput("");
    try {
      const { error } = await supabaseRef.current.from("messages").insert({
        conversation_id: conversationId,
        customer_id: customerId,
        sender_type: "customer",
        sender_name: null,
        message_type: "text",
        content: text,
        is_read: true,
      });
      if (error) throw error;

      // 更新客户最后消息
      await supabaseRef.current
        .from("customers")
        .update({
          last_message_preview: text,
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", customerId);
    } catch (err) {
      console.error("发送失败:", err);
      setInput(text);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  const isEmbedded = typeof window !== "undefined" && window.parent !== window;

  return (
    <div className={isEmbedded ? "flex h-screen w-screen flex-col" : "fixed bottom-0 right-0 z-50 flex flex-col items-end gap-3 p-4 sm:p-6"}>
      {/* 聊天窗口 */}
      {(isOpen || isEmbedded) && (
        <div
          className="flex w-[calc(100vw-2rem)] max-w-[400px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          style={{ height: "min(560px, 75vh)", animation: "slideUp 0.3s ease" }}
        >
          {/* 头部 */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-teal-500 px-4 py-3.5 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">课程顾问</div>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                在线 · 通常1分钟内回复
              </div>
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* 欢迎横幅 */}
          {messages.length === 0 && !isLoading && (
            <div className="border-b border-cyan-50 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-3">
              <div className="flex items-start gap-2 text-xs text-slate-600">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" />
                <p>您好！我是AI课程顾问，可以帮您了解3-6岁学龄前教育课程。有任何问题随时问我~</p>
              </div>
            </div>
          )}

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 px-4 py-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-600" />
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
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-teal-400 text-white">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                          isCustomer
                            ? "rounded-br-md bg-cyan-600 text-white"
                            : msg.sender_type === "ai"
                              ? "rounded-bl-md border border-violet-100 bg-white text-slate-800"
                              : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-100"
                        }`}
                      >
                        {msg.content}
                        <div
                          className={`mt-1 text-[10px] ${isCustomer ? "text-white/60" : "text-slate-400"}`}
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
          </div>

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
                disabled={isSending || isLoading}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-600 text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 text-center text-[10px] text-slate-400">
              由 AI 销售助手提供服务
            </div>
          </div>
        </div>
      )}

      {/* 悬浮按钮（嵌入模式下隐藏，由父窗口控制） */}
      {!isEmbedded && (
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setUnreadCount(0);
        }}
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-lg shadow-cyan-500/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {unreadCount > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        {/* 脉冲动画 */}
        {!isOpen && (
          <span className="absolute inset-0 animate-ping rounded-full bg-cyan-400/30" />
        )}
      </button>
      )}
    </div>
  );
}

export default function WidgetPage() {
  return (
    <SupabaseConfigProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30">
        {/* 演示页面背景 */}
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-1.5 text-xs font-medium text-cyan-700">
            <Sparkles className="h-3.5 w-3.5" />
            在线客服组件演示
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-800">
            这是一个演示页面
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            点击右下角的聊天按钮即可开始咨询。将 chat-widget.js 嵌入任何网站即可使用。
          </p>
        </div>
        <WidgetChat />
        <style jsx global>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </SupabaseConfigProvider>
  );
}
