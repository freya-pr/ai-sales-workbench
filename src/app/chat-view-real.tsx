"use client";

import { useState, useMemo, useEffect } from "react";
import { useSupabase, useCustomers, useMessages, useCustomerTags, getOrCreateConversation, sendMessage, markMessagesRead, type DBCustomer, type DBMessage } from "@/hooks/use-supabase-data";
import { customers as mockCustomers, type Customer, type Message, type AISuggestion } from "@/lib/mock-data";
import { ConversationList } from "@/components/conversation-list";
import { ChatPanel } from "@/components/chat-panel";
import { CustomerProfile } from "@/components/customer-profile";
import { Loader2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";

interface ChatViewProps {
  isAiMode: boolean;
}

// 头像颜色
const AVATAR_COLORS = ["#0891b2", "#7c3aed", "#dc2626", "#ea580c", "#16a34a", "#0d9488", "#6366f1", "#be185d"];

// 将数据库客户转换为UI需要的格式
function convertDBCustomer(db: DBCustomer, dbMessages: DBMessage[] = [], dbTags: { tag_type: string; tag_value: string; confidence: number; source: string }[] = []): Customer {
  const colorIndex = db.name.charCodeAt(0) % AVATAR_COLORS.length;
  const avatar = db.name.charAt(0);

  // 从标签中提取信息
  const getTag = (type: string) => dbTags.find((t) => t.tag_type === type);
  const childAge = getTag("child_age")?.tag_value || "未知";
  const budget = getTag("budget_range")?.tag_value || "未设置";
  const preferredCourse = getTag("preferred_course")?.tag_value || "";
  const decisionMaker = getTag("decision_maker")?.tag_value || "待确认";
  const urgency = getTag("urgency")?.tag_value || "中";

  // 构建标签
  const tags: string[] = [`#${db.intent_level}级`];
  if (childAge !== "未知") tags.push(`#${childAge}`);
  if (preferredCourse) tags.push(`#${preferredCourse}`);
  tags.push(`#${urgency}`);

  const tagClasses: Customer["tagClasses"] = ["s", "info", "purple", "green"];

  // 转换消息
  const messages: Message[] = [];
  let lastDate = "";
  for (const msg of dbMessages) {
    const msgDate = new Date(msg.created_at).toLocaleDateString("zh-CN");
    if (msgDate !== lastDate) {
      messages.push({ type: "date", text: msgDate });
      lastDate = msgDate;
    }
    messages.push({
      text: msg.content || "",
      from: msg.sender_type === "customer" ? "customer" : "sales",
      time: new Date(msg.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    });
  }

  // 如果没有消息，添加空提示
  if (messages.length === 0) {
    messages.push({ type: "date", text: "今天" });
  }

  return {
    id: db.id as unknown as number, // 使用 UUID 字符串，组件中做了兼容
    name: db.name,
    avatar,
    color: AVATAR_COLORS[colorIndex],
    level: db.intent_level,
    childAge,
    childName: db.name.replace(/妈妈|爸爸|家长/, ""),
    tags,
    tagClasses,
    decisionMaker: decisionMaker.includes("妈妈") || decisionMaker.includes("爸爸") ? decisionMaker : `${decisionMaker}（待确认）`,
    budget: budget.includes("元") ? budget : `${budget}元`,
    source: db.source === "widget" ? "在线咨询" : db.source === "wechat" ? "微信" : db.source === "douyin" ? "抖音" : db.source === "referral" ? "朋友推荐" : db.source === "ads" ? "广告投放" : "其他",
    online: db.last_message_at ? Date.now() - new Date(db.last_message_at).getTime() < 5 * 60 * 1000 : false,
    lastActive: db.last_message_at ? formatTimeAgo(db.last_message_at) : "刚刚",
    unread: db.unread_count,
    aiStatus: db.ai_mode ? "pending" : "done",
    preview: db.last_message_preview || "开始对话吧",
    courseProgress: 1,
    checkinDays: 0,
    totalDays: 3,
    streakDays: 0,
    messages,
    aiSuggestions: [] as AISuggestion[],
    dailySummaries: [
      {
        date: new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }),
        summary: "暂无总结",
        suggestion: "继续跟进了解客户需求",
      },
    ],
  };
}

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "刚刚";
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  return `${days}天前`;
}

export function ChatView({ isAiMode }: ChatViewProps) {
  const { supabase, configReady } = useSupabase();
  const { customers: dbCustomers, loading } = useCustomers();
  const [selectedUUID, setSelectedUUID] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "S" | "A" | "B">("all");
  const [search, setSearch] = useState("");
  const [conversationMap, setConversationMap] = useState<Record<string, string>>({});
  const [messagesMap, setMessagesMap] = useState<Record<string, DBMessage[]>>({});

  // 初始化时选中第一个客户
  useEffect(() => {
    if (!selectedUUID && dbCustomers.length > 0) {
      setSelectedUUID(dbCustomers[0].id);
    }
  }, [dbCustomers, selectedUUID]);

  // 获取选中客户的会话ID
  useEffect(() => {
    if (!supabase || !selectedUUID) return;
    if (conversationMap[selectedUUID]) return;

    getOrCreateConversation(supabase, selectedUUID).then((convId) => {
      if (convId) {
        setConversationMap((prev) => ({ ...prev, [selectedUUID]: convId }));
      }
    });
  }, [supabase, selectedUUID, conversationMap]);

  // 加载选中客户的消息
  const convId = selectedUUID ? conversationMap[selectedUUID] : null;
  const { messages: realMessages } = useMessages(convId);

  useEffect(() => {
    if (convId && realMessages.length > 0) {
      setMessagesMap((prev) => ({ ...prev, [convId]: realMessages }));
    }
  }, [convId, realMessages]);

  // 标记已读
  useEffect(() => {
    if (supabase && convId) {
      markMessagesRead(supabase, convId);
    }
  }, [supabase, convId, realMessages.length]);

  // 获取选中客户的标签
  const { tags: selectedTags } = useCustomerTags(selectedUUID);

  // 转换客户数据
  const uiCustomers = useMemo(() => {
    return dbCustomers.map((c) => {
      const cid = c.id;
      const cConvId = conversationMap[cid];
      const cMsgs = cConvId ? messagesMap[cConvId] || [] : [];
      return convertDBCustomer(c, cMsgs);
    });
  }, [dbCustomers, conversationMap, messagesMap]);

  const filteredCustomers = useMemo(() => {
    return uiCustomers.filter((c) => {
      if (filter !== "all" && c.level !== filter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [uiCustomers, filter, search]);

  const selectedCustomer = useMemo(() => {
    if (uiCustomers.length === 0) return mockCustomers[0];
    return uiCustomers.find((c) => String(c.id) === selectedUUID) || uiCustomers[0];
  }, [uiCustomers, selectedUUID]);

  const counts = useMemo(() => ({
    all: uiCustomers.length,
    S: uiCustomers.filter((c) => c.level === "S").length,
    A: uiCustomers.filter((c) => c.level === "A").length,
    B: uiCustomers.filter((c) => c.level === "B").length,
  }), [uiCustomers]);

  // 处理销售发送消息
  const handleSendMessage = async (text: string) => {
    if (!supabase || !selectedUUID || !convId) return;
    await sendMessage(supabase, {
      conversationId: convId,
      customerId: selectedUUID,
      senderType: "sales",
      senderName: "销售顾问",
      content: text,
    });
  };

  if (!configReady || loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          <span className="text-sm">加载客户数据...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-row overflow-hidden">
      <ConversationList
        customers={filteredCustomers}
        selectedId={selectedCustomer.id}
        onSelect={(id) => setSelectedUUID(String(id))}
        filter={filter}
        onFilterChange={setFilter}
        search={search}
        onSearchChange={setSearch}
        counts={counts}
      />
      <ChatPanel customer={selectedCustomer} isAiMode={isAiMode} onSendMessage={handleSendMessage} />
      <CustomerProfile customer={selectedCustomer} dbCustomer={dbCustomers.find((c) => c.id === selectedUUID)} dbTags={selectedTags} />
    </div>
  );
}
