'use client';

import { useState } from 'react';
import {
  Phone,
  Globe,
  Edit3,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Customer, Tag } from '@/lib/mock-data';

interface CustomerProfileProps {
  customer: Customer;
}

export function CustomerProfile({ customer }: CustomerProfileProps) {
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [tags, setTags] = useState<Tag[]>(customer.tags);

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag.label);
    setEditValue(tag.value);
  };

  const handleSaveTag = (label: string) => {
    setTags((prev) =>
      prev.map((t) => (t.label === label ? { ...t, value: editValue } : t))
    );
    setEditingTag(null);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setEditValue('');
  };

  const statusColors: Record<string, string> = {
    completed: 'bg-[#0891b2]',
    'in-progress': 'bg-amber-500',
    upcoming: 'bg-slate-300',
  };

  const statusLabels: Record<string, string> = {
    completed: '已完成',
    'in-progress': '进行中',
    upcoming: '待开始',
  };

  return (
    <div className="flex w-[340px] shrink-0 flex-col border-l border-slate-200 bg-white">
      {/* Header */}
      <div className="border-b border-slate-100 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">客户画像</h3>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0891b2] text-base font-medium text-white">
            {customer.avatar}
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-900">
              {customer.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="border-b border-slate-100 p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          基础信息
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">来源渠道</span>
            <span className="flex items-center gap-1 text-slate-700">
              <Globe className="h-3 w-3 text-[#0891b2]" />
              {customer.source}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">孩子年龄</span>
            <span className="text-slate-700">{customer.childAge}岁</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">决策人角色</span>
            <span className="text-slate-700">{customer.decisionRole}</span>
          </div>
        </div>
      </div>

      {/* AI Tags */}
      <div className="border-b border-slate-100 p-4">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          AI 智能标签
        </h4>
        <div className="space-y-2.5">
          {tags.map((tag) => (
            <div key={tag.label} className="rounded-lg bg-slate-50 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{tag.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400">
                    置信度 {tag.confidence}%
                  </span>
                  {tag.editable && editingTag !== tag.label && (
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              {editingTag === tag.label ? (
                <div className="mt-1.5 flex items-center gap-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-[#0891b2] focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveTag(tag.label)}
                    className="rounded bg-[#0891b2] p-1 text-white hover:bg-[#0e7490]"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded bg-slate-200 p-1 text-slate-600 hover:bg-slate-300"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <p className="mt-0.5 text-sm font-medium text-slate-800">
                  {tag.value}
                </p>
              )}
              {/* Confidence Bar */}
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    tag.confidence >= 90
                      ? 'bg-[#0891b2]'
                      : tag.confidence >= 75
                      ? 'bg-amber-400'
                      : 'bg-slate-400'
                  )}
                  style={{ width: `${tag.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Progress Timeline */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          课程参与进度
        </h4>
        <div className="space-y-0">
          {customer.courseProgress.map((progress, idx) => (
            <div key={progress.day} className="relative flex gap-3 pb-4">
              {/* Timeline line */}
              {idx < customer.courseProgress.length - 1 && (
                <div className="absolute left-[7px] top-5 h-[calc(100%-12px)] w-px bg-slate-200" />
              )}
              {/* Timeline dot */}
              <div className="relative z-10 flex shrink-0 items-start pt-0.5">
                <div
                  className={cn(
                    'h-3.5 w-3.5 rounded-full border-2 border-white',
                    statusColors[progress.status]
                  )}
                />
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">
                    {progress.day}
                  </span>
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                      progress.status === 'completed'
                        ? 'bg-[#ecfeff] text-[#0891b2]'
                        : progress.status === 'in-progress'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-500'
                    )}
                  >
                    {statusLabels[progress.status]}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-700">{progress.title}</p>
                <p className="text-xs text-slate-400">{progress.date}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 space-y-2">
          <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <span>查看完整沟通记录</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          <button className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
            <span>添加跟进备注</span>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
          <button className="flex w-full items-center justify-between rounded-lg border border-[#0891b2]/20 bg-[#ecfeff] px-3 py-2 text-sm text-[#0891b2] hover:bg-[#0891b2]/10 transition-colors">
            <span>安排试听课</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
