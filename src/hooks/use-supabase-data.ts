"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface DBMessage {
  id: string;
  conversation_id: string;
  customer_id: string;
  sender_type: "customer" | "ai" | "sales" | "system";
  sender_name: string | null;
  message_type: string;
  content: string | null;
  image_url: string | null;
  ai_confidence: number | null;
  ai_source: string | null;
  is_read: boolean;
  created_at: string;
}

export interface DBCustomer {
  id: string;
  name: string;
  avatar_url: string | null;
  phone: string | null;
  wechat_id: string | null;
  source: string;
  intent_level: "S" | "A" | "B";
  follow_up_status: string;
  ai_mode: boolean;
  unread_count: number;
  last_message_at: string | null;
  last_message_preview: string | null;
  urgency: number;
  assigned_to: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DBTag {
  id: string;
  customer_id: string;
  tag_type: string;
  tag_value: string;
  confidence: number;
  source: string;
  created_at: string;
  updated_at: string | null;
}

export interface DBConversation {
  id: string;
  customer_id: string;
  status: string;
  title: string | null;
  ai_participation: string;
  created_at: string;
  updated_at: string | null;
}

export interface DBAiSuggestion {
  id: string;
  conversation_id: string;
  content: string;
  confidence: number;
  source_label: string;
  status: string;
  created_at: string;
}

export interface DBCourse {
  id: string;
  name: string;
  category: string;
  age_range: string;
  price: number;
  duration: string;
  description: string | null;
}

// Supabase client singleton hook
let clientInstance: SupabaseClient | null = null;

export function useSupabase() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [configReady, setConfigReady] = useState(false);

  useEffect(() => {
    if (clientInstance) {
      setClient(clientInstance);
      setConfigReady(true);
      return;
    }
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || "") as string;
    fetch(`${base}/api/supabase-config`)
      .then((r) => r.json())
      .then((config) => {
        if (config.url && config.anonKey) {
          if (typeof window !== "undefined") {
            window.__SUPABASE_CONFIG__ = { url: config.url, anonKey: config.anonKey };
          }
          clientInstance = getSupabaseBrowserClient();
          setClient(clientInstance);
        }
        setConfigReady(true);
      })
      .catch(() => setConfigReady(true));
  }, []);

  return { supabase: client, configReady };
}

// 获取所有客户
export function useCustomers() {
  const { supabase, configReady } = useSupabase();
  const [customers, setCustomers] = useState<DBCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("urgency", { ascending: false })
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setCustomers(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (configReady && supabase) fetchCustomers();
  }, [configReady, supabase, fetchCustomers]);

  // 实时订阅客户变化
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("customers_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customers" },
        () => fetchCustomers()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchCustomers]);

  return { customers, loading, refresh: fetchCustomers };
}

// 获取会话消息
export function useMessages(conversationId: string | null) {
  const { supabase } = useSupabase();
  const [messages, setMessages] = useState<DBMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase || !conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(100)
      .then(({ data }) => {
        if (data) setMessages(data);
        setLoading(false);
      });
  }, [supabase, conversationId]);

  // 实时订阅新消息
  useEffect(() => {
    if (!supabase || !conversationId) return;
    const channel = supabase
      .channel(`msgs_${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as DBMessage]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, conversationId]);

  return { messages, loading, setMessages };
}

// 获取或创建客户的活跃会话
export async function getOrCreateConversation(
  supabase: SupabaseClient,
  customerId: string
): Promise<string | null> {
  const { data: convs } = await supabase
    .from("conversations")
    .select("id")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1);

  if (convs && convs.length > 0) return convs[0].id;

  const { data: newConv } = await supabase
    .from("conversations")
    .insert({
      customer_id: customerId,
      status: "active",
      title: "在线咨询",
      ai_participation: "full",
    })
    .select("id")
    .single();
  return newConv?.id || null;
}

// 获取客户标签
export function useCustomerTags(customerId: string | null) {
  const { supabase } = useSupabase();
  const [tags, setTags] = useState<DBTag[]>([]);

  useEffect(() => {
    if (!supabase || !customerId) {
      setTags([]);
      return;
    }
    supabase
      .from("customer_tags")
      .select("*")
      .eq("customer_id", customerId)
      .order("tag_type")
      .then(({ data }) => {
        if (data) setTags(data);
      });
  }, [supabase, customerId]);

  const updateTag = useCallback(
    async (tagId: string, tagValue: string) => {
      if (!supabase) return;
      const { error } = await supabase
        .from("customer_tags")
        .update({ tag_value: tagValue, source: "manual", updated_at: new Date().toISOString() })
        .eq("id", tagId);
      if (!error) {
        setTags((prev) =>
          prev.map((t) =>
            t.id === tagId ? { ...t, tag_value: tagValue, source: "manual" } : t
          )
        );
      }
    },
    [supabase]
  );

  return { tags, updateTag };
}

// 发送消息
export async function sendMessage(
  supabase: SupabaseClient,
  params: {
    conversationId: string;
    customerId: string;
    senderType: "customer" | "ai" | "sales";
    senderName: string | null;
    content: string;
    messageType?: string;
  }
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: params.conversationId,
    customer_id: params.customerId,
    sender_type: params.senderType,
    sender_name: params.senderName,
    content: params.content,
    message_type: params.messageType || "text",
    is_read: true,
  });

  if (!error) {
    await supabase
      .from("customers")
      .update({
        last_message_preview: params.content,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.customerId);
  }
  return { error };
}

// 标记消息已读
export async function markMessagesRead(
  supabase: SupabaseClient,
  conversationId: string
) {
  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_type", "customer");
}
