'use client';

import { useState } from 'react';
import {
  BookOpen,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MessageSquare,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { scriptLibrary } from '@/lib/mock-data';

export function AICopilotView() {
  const [expandedCategory, setExpandedCategory] = useState<string>('开场白');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const strategies = [
    {
      title: '新客户破冰策略',
      description: '首次接触客户时，通过共情和专业知识建立信任',
      steps: ['了解客户来源渠道', '匹配相似案例', '提出开放式问题', '展示专业资质'],
      icon: MessageSquare,
      color: 'text-[#0891b2]',
      bgColor: 'bg-[#ecfeff]',
    },
    {
      title: '需求挖掘策略',
      description: '通过系统性提问发现客户真实需求与痛点',
      steps: ['了解孩子基本情况', '探索教育困惑', '确认期望目标', '评估决策流程'],
      icon: Target,
      color: 'text-[#8b5cf6]',
      bgColor: 'bg-[#8b5cf6]/5',
    },
    {
      title: '异议处理策略',
      description: '针对常见异议（价格/时间/效果）的专业应对方法',
      steps: ['认同客户感受', '提供数据支撑', '给出替代方案', '创造紧迫感'],
      icon: Zap,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">AI 副驾</h1>
          <p className="mt-1 text-sm text-slate-500">
            话术库与沟通策略，助力高效成交
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Script Library - Left 2/3 */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#0891b2]" />
                <h2 className="text-base font-semibold text-slate-900">
                  话术库
                </h2>
              </div>
              <div className="space-y-2">
                {scriptLibrary.map((category) => (
                  <div key={category.category} className="rounded-lg border border-slate-100">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.category
                            ? ''
                            : category.category
                        )
                      }
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {category.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {category.scripts.length} 条话术
                        </span>
                        {expandedCategory === category.category ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    </button>
                    {expandedCategory === category.category && (
                      <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                        {category.scripts.map((script, idx) => {
                          const scriptId = `${category.category}-${idx}`;
                          return (
                            <div
                              key={idx}
                              className="rounded-lg bg-slate-50 p-3"
                            >
                              <div className="mb-1.5 flex items-center justify-between">
                                <span className="text-xs font-medium text-[#0891b2]">
                                  {script.title}
                                </span>
                                <button
                                  onClick={() =>
                                    handleCopy(script.content, scriptId)
                                  }
                                  className={cn(
                                    'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
                                    copiedId === scriptId
                                      ? 'bg-green-100 text-green-700'
                                      : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                  )}
                                >
                                  {copiedId === scriptId ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      已复制
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      复制
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-sm leading-relaxed text-slate-600">
                                {script.content}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Communication Strategies - Right 1/3 */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#8b5cf6]" />
                <h2 className="text-base font-semibold text-slate-900">
                  沟通策略
                </h2>
              </div>
              <div className="space-y-3">
                {strategies.map((strategy) => {
                  const Icon = strategy.icon;
                  return (
                    <div
                      key={strategy.title}
                      className={cn('rounded-xl border border-slate-100 p-4', strategy.bgColor)}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', strategy.color)} />
                        <h3 className="text-sm font-semibold text-slate-800">
                          {strategy.title}
                        </h3>
                      </div>
                      <p className="mb-3 text-xs text-slate-500">
                        {strategy.description}
                      </p>
                      <div className="space-y-1.5">
                        {strategy.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-slate-600"
                          >
                            <span
                              className={cn(
                                'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white',
                                strategy.color.replace('text-', 'bg-')
                              )}
                            >
                              {idx + 1}
                            </span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-xl border border-[#0891b2]/20 bg-[#ecfeff] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[#0891b2]">
                今日 AI 提示
              </h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#0891b2]" />
                  本周「价格异议」频率上升 23%，建议复习价格应对话术
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#0891b2]" />
                  成功案例：杨明上周用「从众心理」话术成功转化 3 位 A 级客户
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-[#0891b2]" />
                  建议在与新客户沟通的前 3 分钟内完成需求初步判断
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
