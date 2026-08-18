'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/mock-data';

interface CustomerProfileProps {
  customer: Customer;
}

const tagClassMap: Record<string, string> = {
  s: 'bg-red-50 text-red-500 border-red-200',
  a: 'bg-orange-50 text-orange-500 border-orange-200',
  b: 'bg-blue-50 text-blue-500 border-blue-200',
  info: 'bg-cyan-50 text-[#0e7490] border-cyan-200',
  purple: 'bg-violet-50 text-violet-500 border-violet-200',
  green: 'bg-green-50 text-green-600 border-green-200',
};

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const [openSummary, setOpenSummary] = useState<number>(0); // first open by default

  const steps = ['Day0', 'Day1', 'Day2', 'Day3'];
  const progress = customer.courseProgress;

  return (
    <aside className="w-[330px] shrink-0 overflow-y-auto border-l border-gray-200 bg-white custom-scrollbar">
      {/* Profile Section */}
      <div className="border-b border-gray-100 p-4">
        <div className="mb-4 flex items-center gap-3.5">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-[22px] font-bold text-white shadow-md"
            style={{ background: customer.color }}
          >
            {customer.avatar}
          </div>
          <div>
            <div className="text-[17px] font-bold text-gray-800">
              {customer.name}
            </div>
            <div className="mt-0.5 text-xs text-gray-500">
              孩子: {customer.childName} · {customer.childAge}
            </div>
          </div>
        </div>

        {/* Tag capsules */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {customer.tags.map((tag, i) => (
            <span
              key={i}
              className={cn(
                'cursor-default rounded-xl border px-2.5 py-1 text-[11.5px] font-medium transition-transform hover:scale-105',
                tagClassMap[customer.tagClasses[i]] ?? tagClassMap.info
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-lg bg-gray-50 p-2.5 px-3">
            <div className="mb-0.5 text-[11px] text-gray-400">决策人</div>
            <div className="text-[13px] font-semibold text-gray-700">
              {customer.decisionMaker.split('（')[0]}
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 p-2.5 px-3">
            <div className="mb-0.5 text-[11px] text-gray-400">年投入预算</div>
            <div className="text-[13px] font-semibold text-gray-700">
              {customer.budget.split('/')[0]}
            </div>
          </div>
          <div className="col-span-2 rounded-lg bg-gray-50 p-2.5 px-3">
            <div className="mb-0.5 text-[11px] text-gray-400">来源渠道</div>
            <div className="text-[13px] font-semibold text-gray-700">
              {customer.source}
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="border-b border-gray-100 p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[13.5px] font-bold text-gray-700">
          📚 课程参与状态
        </div>
        <div className="mb-2 flex items-center">
          {steps.map((step, i) => {
            const isCompleted = i < progress;
            const isCurrent = i === progress;
            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="relative flex flex-1 flex-col items-center">
                  <div
                    className={cn(
                      'relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-semibold text-white transition-all',
                      isCompleted && 'bg-[#0891b2]',
                      isCurrent &&
                        'bg-[#14b8a6] shadow-[0_0_0_4px_rgba(20,184,166,0.2)]',
                      !isCompleted && !isCurrent && 'bg-gray-200'
                    )}
                  >
                    {isCompleted ? '✓' : i + 1}
                  </div>
                  <div
                    className={cn(
                      'mt-1 text-[10px]',
                      isCompleted || isCurrent
                        ? 'font-semibold text-[#0e7490]'
                        : 'text-gray-400'
                    )}
                  >
                    {step}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'relative -top-3 h-[3px] w-[30px] shrink-0',
                      i < progress ? 'bg-[#0891b2]' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Checkin Stats */}
        <div className="mt-3 flex gap-2">
          {[
            { num: customer.checkinDays, label: '累计打卡' },
            { num: customer.totalDays, label: '总天数' },
            { num: customer.streakDays, label: '连续打卡' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-lg bg-gray-50 py-2 text-center"
            >
              <div className="text-[18px] font-bold text-[#0e7490]">
                {stat.num}
              </div>
              <div className="mt-0.5 text-[10px] text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Summaries */}
      <div className="p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[13.5px] font-bold text-gray-700">
          📝 每日会话总结
        </div>
        {customer.dailySummaries.map((s, i) => (
          <div
            key={i}
            className={cn(
              'mb-2 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 transition-all hover:border-gray-200',
              openSummary === i && 'open'
            )}
          >
            <div
              onClick={() => setOpenSummary(openSummary === i ? -1 : i)}
              className="flex cursor-pointer select-none items-center justify-between px-3.5 py-2.5 hover:bg-gray-100"
            >
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700">
                📅 {s.date}
              </div>
              <span
                className={cn(
                  'text-xs text-gray-400 transition-transform duration-200',
                  openSummary === i && 'rotate-180'
                )}
              >
                ▼
              </span>
            </div>
            {openSummary === i && (
              <div className="px-3.5 pb-3">
                <div className="mb-2 text-[12.5px] leading-relaxed text-gray-600">
                  {s.summary}
                </div>
                <div
                  className="rounded-md py-2 pl-2.5 pr-2.5 text-xs leading-snug text-[#0e7490]"
                  style={{
                    background: 'linear-gradient(135deg, #ecfeff, #f0fdfa)',
                    borderLeft: '3px solid #0891b2',
                  }}
                >
                  <strong className="mb-0.5 block text-[11px] uppercase tracking-wide">
                    💡 跟进建议
                  </strong>
                  {s.suggestion}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
