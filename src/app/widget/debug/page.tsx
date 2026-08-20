"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface DiagStep {
  name: string;
  status: "pending" | "running" | "ok" | "fail";
  detail?: string;
  ms?: number;
}

export default function WidgetDebugPage() {
  const [steps, setSteps] = useState<DiagStep[]>([
    { name: "读取 Supabase 配置（构建时环境变量）", status: "pending" },
    { name: "创建 Supabase 客户端", status: "pending" },
    { name: "连接数据库 REST API", status: "pending" },
    { name: "查询 customers 表（验证 RLS）", status: "pending" },
    { name: "Realtime 连接测试", status: "pending" },
  ]);
  const [rawConfig, setRawConfig] = useState<string>("");

  const update = (i: number, patch: Partial<DiagStep>) => {
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  useEffect(() => {
    const run = async () => {
      const t0 = Date.now();
      // Step 0: 配置
      update(0, { status: "running" });
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      setRawConfig(JSON.stringify({ url, keyPrefix: key?.slice(0, 20), keyLen: key?.length }, null, 2));
      if (!url || !key) {
        update(0, { status: "fail", detail: "环境变量未注入，请检查 Vercel NEXT_PUBLIC_SUPABASE_* 配置", ms: Date.now() - t0 });
        return;
      }
      update(0, { status: "ok", detail: url, ms: Date.now() - t0 });

      // Step 1: 创建客户端
      update(1, { status: "running" });
      const t1 = Date.now();
      let supabase: any;
      try {
        const { createClient } = await import("@supabase/supabase-js");
        supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          realtime: { params: { eventsPerSecond: -1 } },
        });
        update(1, { status: "ok", ms: Date.now() - t1 });
      } catch (e: any) {
        update(1, { status: "fail", detail: e?.message || String(e), ms: Date.now() - t1 });
        return;
      }

      // Step 2: REST 健康检查
      update(2, { status: "running" });
      const t2 = Date.now();
      try {
        const res = await fetch(`${url}/rest/v1/`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        update(2, { status: "ok", detail: `HTTP ${res.status}`, ms: Date.now() - t2 });
      } catch (e: any) {
        update(2, { status: "fail", detail: `${e?.message || e}（可能是 CORS/网络/域名不可达）`, ms: Date.now() - t2 });
        return;
      }

      // Step 3: 查询 customers 验证 RLS
      update(3, { status: "running" });
      const t3 = Date.now();
      try {
        const { data, error, count } = await supabase
          .from("customers")
          .select("id", { count: "exact" })
          .limit(5);
        if (error) throw error;
        update(3, { status: "ok", detail: `返回 ${data?.length || 0} 行，总数 ${count ?? "?"}`, ms: Date.now() - t3 });
      } catch (e: any) {
        update(3, { status: "fail", detail: e?.message || String(e), ms: Date.now() - t3 });
      }

      // Step 4: Realtime
      update(4, { status: "running" });
      const t4 = Date.now();
      try {
        const channel = supabase.channel("debug_test");
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error("5秒内未连接成功")), 5000);
          channel.subscribe((status: string) => {
            if (status === "SUBSCRIBED") {
              clearTimeout(timer);
              resolve();
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
              clearTimeout(timer);
              reject(new Error(`状态: ${status}`));
            }
          });
        });
        update(4, { status: "ok", detail: "WebSocket 已连接", ms: Date.now() - t4 });
        supabase.removeChannel(channel);
      } catch (e: any) {
        update(4, { status: "fail", detail: e?.message || String(e), ms: Date.now() - t4 });
      }
    };

    run();
  }, []);

  const allOk = steps.every((s) => s.status === "ok");
  const anyFail = steps.some((s) => s.status === "fail");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-1 text-xl font-bold text-slate-800">聊天组件连接诊断</h1>
        <p className="mb-6 text-sm text-slate-500">
          如果下方所有步骤都是 ✅，说明 widget 应当能正常工作（请强制刷新聊天页面）。如果有 ❌，把本页截图发我。
        </p>

        <div
          className={`mb-6 rounded-xl p-4 text-sm font-medium ${
            allOk ? "bg-emerald-50 text-emerald-700" : anyFail ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {allOk ? "✅ 全部通过，聊天组件应该可以正常加载" : anyFail ? "❌ 检测到问题，请查看下方详情" : "⏳ 检测中..."}
        </div>

        <div className="space-y-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">#{i + 1}</span>
                  <span className="text-sm font-medium text-slate-800">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {s.ms !== undefined && <span className="text-[11px] text-slate-400">{s.ms}ms</span>}
                  {s.status === "pending" && <span className="text-xs text-slate-400">待检测</span>}
                  {s.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-cyan-600" />}
                  {s.status === "ok" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                  {s.status === "fail" && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {s.detail && (
                <div className={`mt-2 rounded-md px-3 py-2 text-xs font-mono break-all ${s.status === "fail" ? "bg-red-50 text-red-700" : "bg-slate-50 text-slate-600"}`}>
                  {s.detail}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <div className="mb-2 text-xs font-semibold text-slate-500">原始配置（调试用）</div>
          <pre className="overflow-x-auto rounded bg-slate-900 p-3 text-[11px] text-emerald-300">{rawConfig || "加载中..."}</pre>
        </div>

        <div className="mt-6 text-center">
          <a href="/chat" className="text-sm text-cyan-600 hover:underline">← 返回聊天页</a>
        </div>
      </div>
    </div>
  );
}
