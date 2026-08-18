'use client';

import { useState } from 'react';
import {
  Search,
  Filter,
  Edit3,
  ChevronDown,
  Phone,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { customers } from '@/lib/mock-data';

export function CustomerManagementView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('intent');

  const filteredCustomers = customers.filter((c) => {
    if (searchQuery && !c.name.includes(searchQuery) && !c.phone.includes(searchQuery)) return false;
    if (filterLevel !== 'all' && c.intentLevel !== filterLevel) return false;
    return true;
  });

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (sortBy === 'intent') {
      const order = { S: 0, A: 1, B: 2 };
      return order[a.intentLevel] - order[b.intentLevel];
    }
    return 0;
  });

  const intentColors: Record<string, string> = {
    S: 'bg-red-50 text-red-700 border-red-200',
    A: 'bg-amber-50 text-amber-700 border-amber-200',
    B: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">客户画像管理</h1>
            <p className="mt-1 text-sm text-slate-500">
              管理所有客户的 AI 标签与画像信息
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>共 {customers.length} 位客户</span>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索客户姓名或手机号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#0891b2] focus:outline-none focus:ring-1 focus:ring-[#0891b2]"
            />
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
            {[
              { key: 'all', label: '全部' },
              { key: 'S', label: 'S级' },
              { key: 'A', label: 'A级' },
              { key: 'B', label: 'B级' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterLevel(item.key)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  filterLevel === item.key
                    ? 'bg-white text-[#0891b2] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 focus:outline-none"
            >
              <option value="intent">按意向度</option>
              <option value="time">按时间</option>
              <option value="source">按来源</option>
            </select>
          </div>
        </div>

        {/* Customer Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">客户</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">联系方式</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">来源</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">意向度</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">预算</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">偏好课程</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">孩子年龄</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium text-white',
                        customer.intentLevel === 'S' ? 'bg-red-500' :
                        customer.intentLevel === 'A' ? 'bg-amber-500' : 'bg-green-500'
                      )}>
                        {customer.avatar}
                      </div>
                      <span className="text-sm font-medium text-slate-900">
                        {customer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Globe className="h-3 w-3 text-slate-400" />
                      {customer.source}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
                      intentColors[customer.intentLevel]
                    )}>
                      {customer.intentLevel}级
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {customer.budgetRange}元
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {customer.preferredCourse}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {customer.childAge}岁
                  </td>
                  <td className="px-4 py-3">
                    <button className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0891b2] transition-colors">
                      <Edit3 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
