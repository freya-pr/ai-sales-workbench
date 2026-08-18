'use client';

import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  MessageSquare,
  Target,
  Lightbulb,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { topFAQs, intentDistribution } from '@/lib/mock-data';

export function AIInsightsView() {
  const trendIcons = {
    up: <TrendingUp className="h-3 w-3 text-red-500" />,
    down: <TrendingDown className="h-3 w-3 text-green-500" />,
    stable: <Minus className="h-3 w-3 text-slate-400" />,
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">AI 洞察</h1>
          <p className="mt-1 text-sm text-slate-500">
            团队级 AI 分析，帮助您了解客户趋势与常见问题
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: '今日会话总量', value: '23', change: '+15%', icon: MessageSquare, color: 'text-[#0891b2]' },
            { label: 'AI 自动回复率', value: '65%', change: '+8%', icon: Brain, color: 'text-[#8b5cf6]' },
            { label: 'S级客户数', value: '12', change: '+3', icon: Target, color: 'text-red-500' },
            { label: '平均响应时间', value: '2.3min', change: '-12%', icon: Lightbulb, color: 'text-amber-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
                <span className="text-xs font-medium text-green-600">
                  {stat.change}
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top 10 FAQs */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              常见问题 Top 10
            </h2>
            <div className="space-y-2">
              {topFAQs.map((faq) => (
                <div
                  key={faq.rank}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
                >
                  <span
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      faq.rank <= 3
                        ? 'bg-[#0891b2] text-white'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {faq.rank}
                  </span>
                  <p className="flex-1 text-sm text-slate-700">
                    {faq.question}
                  </p>
                  <span className="text-xs text-slate-400">
                    {faq.count}次
                  </span>
                  {trendIcons[faq.trend]}
                </div>
              ))}
            </div>
          </div>

          {/* Intent Distribution */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                客户意向分布
              </h2>
              <div className="space-y-4">
                {intentDistribution.map((item) => (
                  <div key={item.level}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {item.level}
                      </span>
                      <span className="text-sm text-slate-500">
                        {item.count}位 ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-600">
                  <span className="font-medium text-slate-800">AI 分析：</span>
                  本周 A 级客户占比最高(47%)，建议重点跟进转化为 S 级。S 级客户数量较上周增长 20%，转化势头良好。
                </p>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="rounded-xl border border-[#0891b2]/20 bg-[#ecfeff] p-5">
              <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-[#0891b2]">
                <Brain className="h-5 w-5" />
                AI 建议
              </h2>
              <ul className="space-y-2">
                {[
                  '本周三下午 14:00-16:00 是客户响应高峰期，建议集中跟进',
                  '「价格异议」是本周最常见问题，建议更新话术库中的价格应对策略',
                  '3位 S 级客户进入签约阶段，建议优先处理',
                  '团队平均响应时间优化 12%，继续保持',
                ].map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0891b2]" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
