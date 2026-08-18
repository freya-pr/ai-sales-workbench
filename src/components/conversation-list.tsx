'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Customer, IntentLevel } from '@/lib/mock-data';

interface ConversationListProps {
  customers: Customer[];
  selectedId: number;
  onSelect: (id: number) => void;
  filter: 'all' | IntentLevel;
  onFilterChange: (f: 'all' | IntentLevel) => void;
  search: string;
  onSearchChange: (s: string) => void;
  counts: Record<string, number>;
}

const levelTagClass: Record<IntentLevel, string> = {
  S: 'bg-red-50 text-red-500',
  A: 'bg-orange-50 text-orange-500',
  B: 'bg-blue-50 text-blue-500',
};

const avatarColors: Record<IntentLevel, string> = {
  S: '#ef4444',
  A: '#f97316',
  B: '#3b82f6',
};

export function ConversationList({
  customers,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  counts,
}: ConversationListProps) {
  const filters: { key: 'all' | IntentLevel; label: string; count?: number }[] = [
    { key: 'all', label: '全部', count: counts.all },
    { key: 'S', label: 'S级' },
    { key: 'A', label: 'A级' },
    { key: 'B', label: 'B级' },
  ];

  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="p-4 pb-0">
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-[11px] top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索客户姓名、手机号..."
            className="w-full rounded-lg border-[1.5px] border-gray-200 bg-gray-50 py-[9px] pl-9 pr-3 text-[13px] outline-none transition-all focus:border-cyan-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(6,182,212,0.1)]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="mb-2 flex gap-1.5 border-b border-gray-100 pb-3">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={cn(
                'cursor-pointer rounded-[14px] px-3 py-1 text-xs font-medium transition-all',
                filter === f.key
                  ? 'bg-[#0891b2] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f.label}
              {f.count !== undefined && (
                <span
                  className={cn(
                    'ml-0.5 inline-block rounded-lg px-1.5 py-0 text-[10px]',
                    filter === f.key ? 'bg-white/25' : 'bg-white/50'
                  )}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
        {customers.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={cn(
              'mb-0.5 flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-all',
              selectedId === c.id
                ? 'border-l-3 border-l-[#0891b2] bg-[#ecfeff] pl-[9px]'
                : 'hover:bg-gray-50'
            )}
          >
            {/* Avatar */}
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-white"
              style={{ background: c.color }}
            >
              {c.avatar}
              {c.online && (
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {c.name}
                </span>
                <span className="text-[11px] text-gray-400">
                  {c.lastActive}
                </span>
              </div>
              <p className="mb-1.5 truncate text-[12.5px] leading-snug text-gray-500">
                {c.preview}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                      levelTagClass[c.level]
                    )}
                  >
                    {c.level}级
                  </span>
                  <span
                    className={cn(
                      'rounded-[10px] px-1.5 py-0.5 text-[10px] font-medium',
                      c.aiStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-600'
                    )}
                  >
                    {c.aiStatus === 'pending' ? '⏳ 待处理' : '✅ 已处理'}
                  </span>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
