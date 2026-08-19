"use client";

import { Suspense } from "react";
import { Sparkles, GraduationCap, ShieldCheck } from "lucide-react";

function ChatLandingInner() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-cyan-50 via-white to-teal-50">
      {/* 顶部品牌 */}
      <header className="flex items-center justify-between border-b border-slate-100 bg-white/70 px-5 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-teal-500 text-white shadow-sm">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">智学规划</div>
            <div className="text-[10px] text-slate-400">3-6岁学龄前家庭教育</div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          顾问在线
        </div>
      </header>

      {/* 主体：左侧介绍 + 右侧聊天 */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:py-10">
        <section className="flex-1">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-cyan-100/80 px-3 py-1 text-[11px] font-medium text-cyan-700">
            <Sparkles className="h-3 w-3" />
            AI 智能规划，1对1专属顾问
          </div>
          <h1 className="text-2xl font-bold leading-tight text-slate-800 sm:text-3xl">
            为 3-6 岁孩子
            <br />
            定制科学的成长方案
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600">
            从语言启蒙、思维训练到阅读习惯，结合孩子年龄与性格特点，规划个性化学习路径。现在咨询可免费领取试听课程。
          </p>

          <div className="mt-6 space-y-3">
            {[
              { icon: Sparkles, title: "AI 学情诊断", desc: "3分钟生成专属成长报告" },
              { icon: GraduationCap, title: "名师1对1", desc: "资深教育顾问全程陪伴" },
              { icon: ShieldCheck, title: "满意保障", desc: "试听不满意全额退款" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-cyan-100 bg-cyan-50/40 p-4">
            <div className="mb-1 text-[12px] font-semibold text-cyan-800">🎁 本月限时福利</div>
            <p className="text-[12px] leading-relaxed text-cyan-900/80">
              首次咨询即送 <strong>99元4节体验课</strong>，包含 1对1 学情测评 + 专属成长规划报告。
            </p>
          </div>
        </section>

        {/* 聊天容器 - 直接嵌入 widget 组件，避免 iframe 跨域问题 */}
        <section className="flex w-full items-stretch md:w-[420px] md:shrink-0">
          <div className="relative h-[72vh] w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 md:h-auto md:min-h-[600px]">
            <iframe
              src="/widget?auto=1&ref=landing"
              title="在线咨询"
              className="h-full w-full border-0"
              allow="clipboard-write"
            />
          </div>
        </section>
      </main>

      <footer className="px-5 py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} 智学规划 · 专业的家庭教育顾问
      </footer>
    </div>
  );
}

export default function ChatLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
          加载中...
        </div>
      }
    >
      <ChatLandingInner />
    </Suspense>
  );
}
