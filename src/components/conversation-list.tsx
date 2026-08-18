'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Bot,
  User,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Customer } from '@/lib/mock-data';

interface ConversationListProps {
  customers: Customer[];
  selectedId: string;
  onSelect: (id: string) => void;
}

type FilterType = 'all' | 'S' | 'A' | 'B' | 'unfollowed' | 'pending';

export function ConversationList({
  customers,
  selectedId,
  onSelect,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [mode, setMode] = useState<'all' | 'ai' | 'human'>('all');

  const filteredCustomers = customers.filter((customer) => {
    // Search filter
    if (
      searchQuery &&
      !customer.name.includes(searchQuery) &&
      !customer.phone.includes(searchQuery)
    ) {
      return false;
    }

    // Mode filter
    if (mode === 'ai' && !customer.aiReception) return false;
    if (mode === 'human' && customer.aiReception) return false;

    // Type filter
    if (filter === 'S' && customer.intentLevel !== 'S') return false;
    if (filter === 'A' && customer.intentLevel !== 'A') return false;
    if (filter === 'B' && customer.intentLevel !== 'B') return false;
    if (filter === 'unfollowed' && customer.unreadCount > 0) return false;
    if (filter === 'pending' && customer.intentLevel !== 'S') return false;

    return true;
  });

  // Sort by urgency: unread count desc, then S > A > B
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
    const levelOrder = { S: 0, A: 1, B: 2 };
    return levelOrder[a.intentLevel] - levelOrder[b.intentLevel];
  });

  const intentColors: Record<string, string> = {
    S: 'bg-red-500',
    A: 'bg-amber-500',
    B: 'bg-green-500',
  };

  const intentBgColors: Record<string, string> = {
    S: 'bg-red-50 text-red-700 border-red-200',
    A: 'bg-amber-50 text-amber-700 border-amber-200',
    B: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Search & Filter Header */}
      <div className="border-b border-slate-100 p-3">
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索客户..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#0891b2] focus:outline-none focus:ring-1 focus:ring-[#0891b2]"
          />
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
          {[
            { key: 'all' as const, label: '全部', icon: Circle },
            { key: 'ai' as const, label: 'AI接待', icon: Bot },
            { key: 'human' as const, label: '人工接待', icon: User },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setMode(item.key)}
              className={cn(
                'flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                mode === item.key
                  ? 'bg-white text-[#0891b2] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              <item.icon className="h-3 w-3" />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 px-3 py-2">
        <Filter className="mr-1 h-3 w-3 text-slate-400" />
        {[
          { key: 'all' as const, label: '全部' },
          { key: 'S' as const, label: 'S级' },
          { key: 'A' as const, label: 'A级' },
          { key: 'B' as const, label: 'B级' },
          { key: 'unfollowed' as const, label: '未跟进' },
          { key: 'pending' as const, label: '待确认' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-all',
              filter === item.key
                ? 'bg-[#0891b2] text-white'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedCustomers.map((customer) => (
          <button
            key={customer.id}
            onClick={() => onSelect(customer.id)}
            className={cn(
              'flex w-full items-start gap-3 border-b border-slate-50 px-3 py-3 text-left transition-all hover:bg-slate-50',
              selectedId === customer.id && 'bg-[#ecfeff] border-l-2 border-l-[#0891b2]'
            )}
          >
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium text-white',
                  customer.intentLevel === 'S'
                    ? 'bg-red-500'
                    : customer.intentLevel === 'A'
                    ? 'bg-amber-500'
                    : 'bg-green-500'
                )}
              >
                {customer.avatar}
              </div>
              {customer.aiReception && (
                <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8b5cf6] ring-2 ring-white">
                  <Bot className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {customer.name}
                </span>
                <span className="text-xs text-slate-400">
                  {customer.lastMessageTime}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {customer.lastMessage}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                    intentBgColors[customer.intentLevel]
                  )}
                >
                  {customer.intentLevel}级
                </span>
                {customer.unreadCount > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {customer.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-slate-100 px-3 py-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>共 {sortedCustomers.length} 位客户</span>
          <span>
            AI接待 {customers.filter((c) => c.aiReception).length} / 人工接待{' '}
            {customers.filter((c) => !c.aiReception).length}
          </span>
        </div>
      </div>
    </div>
  );
}
