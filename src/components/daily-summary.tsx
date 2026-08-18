'use client';

import {
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { dailySummaries } from '@/lib/mock-data';

interface DailySummaryProps {
  show: boolean;
  onToggle: () => void;
}

export function DailySummary({ show, onToggle }: DailySummaryProps) {
  const today = dailySummaries[0];

  return (
    <div
      className={cn(
        'border-t border-slate-200 bg-white transition-all duration-300',
        show ? 'h-[200px]' : 'h-10'
      )}
    >
      {/* Toggle Header */}
      <button
        onClick={onToggle}
        className="flex h-10 w-full items-center justify-between border-b border-slate-100 px-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[#0891b2]" />
          <span className="text-sm font-medium text-slate-700">
            每日会话总结
          </span>
          <span className="text-xs text-slate-400">{today.date}</span>
        </div>
        {show ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Content */}
      {show && (
        <div className="flex h-[calc(100%-40px)] gap-4 overflow-hidden p-4">
          {/* Summary */}
          <div className="flex-1 rounded-xl bg-slate-50 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <AlertCircle className="h-3.5 w-3.5 text-[#0891b2]" />
              今日摘要
            </h4>
            <p className="text-sm leading-relaxed text-slate-700">
              {today.summary}
            </p>
          </div>

          {/* Intent Changes */}
          <div className="flex-1 rounded-xl bg-slate-50 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              意向变化
            </h4>
            <ul className="space-y-1.5">
              {today.intentChanges.map((change, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-slate-600"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  {change}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Items */}
          <div className="flex-1 rounded-xl bg-slate-50 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              跟进动作
            </h4>
            <ul className="space-y-1.5">
              {today.actionItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-slate-600"
                >
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Tomorrow Priority */}
          <div className="flex-1 rounded-xl bg-[#ecfeff] p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-[#0891b2]">
              <Calendar className="h-3.5 w-3.5" />
              明日优先跟进
            </h4>
            <ul className="space-y-1.5">
              {today.tomorrowPriority.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-slate-700"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0891b2] text-[10px] font-medium text-white">
                    {idx + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
