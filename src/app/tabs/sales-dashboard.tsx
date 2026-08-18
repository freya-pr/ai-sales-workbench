'use client';

import { customers } from '@/lib/mock-data';

const stats = [
  {
    icon: '💬',
    bg: '#ecfeff',
    value: '247',
    label: '活跃客户数',
    change: '↑ 12% vs 上周',
    changeClass: 'up',
  },
  {
    icon: '✅',
    bg: '#f0fdf4',
    value: '38',
    label: '今日成交单数',
    change: '↑ 8% vs 昨日',
    changeClass: 'up',
  },
  {
    icon: '💰',
    bg: '#fef3c7',
    value: '¥156,800',
    label: '今日成交额',
    change: '↑ 23% vs 昨日',
    changeClass: 'up',
  },
  {
    icon: '⏱️',
    bg: '#f5f3ff',
    value: '2.3min',
    label: '平均响应时长',
    change: '↓ 15% (更快)',
    changeClass: 'up',
  },
];

const weekData = [
  { day: '周一', val: 28, color: '#0891b2' },
  { day: '周二', val: 32, color: '#06b6d4' },
  { day: '周三', val: 25, color: '#14b8a6' },
  { day: '周四', val: 38, color: '#0891b2' },
  { day: '周五', val: 42, color: '#06b6d4' },
  { day: '周六', val: 35, color: '#14b8a6' },
  { day: '周日', val: 38, color: '#0891b2' },
];

const levelDistribution = [
  { level: 'S级', count: 62, percent: 25, color: '#ef4444' },
  { level: 'A级', count: 98, percent: 40, color: '#f97316' },
  { level: 'B级', count: 87, percent: 55, color: '#3b82f6' },
];

export function DashboardView() {
  return (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
      <h2 className="mb-5 text-xl font-bold text-gray-800">📊 销售看板</h2>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-[10px] text-xl"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <div className="text-[28px] font-extrabold leading-tight text-gray-800">
              {s.value}
            </div>
            <div className="mt-0.5 text-[13px] text-gray-500">{s.label}</div>
            <div
              className={`mt-2 text-xs font-semibold ${
                s.changeClass === 'up' ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-gray-800">
          📈 本周每日成交趋势
        </h3>
        <div className="flex h-[180px] items-end gap-3 px-2.5">
          {weekData.map((d) => (
            <div
              key={d.day}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <span className="text-[11px] font-bold text-gray-700">
                {d.val}
              </span>
              <div
                className="w-full max-w-10 rounded-t-md transition-all"
                style={{
                  height: `${(d.val / 45) * 160}px`,
                  background: d.color,
                }}
              />
              <span className="text-[11px] text-gray-500">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Level Distribution */}
      <div className="mb-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-gray-800">
          🏆 客户等级分布
        </h3>
        <div className="flex-1 px-2.5 py-2.5">
          {levelDistribution.map((l) => (
            <div
              key={l.level}
              className="mb-3 flex items-center gap-2.5 last:mb-0"
            >
              <span className="w-8 text-[13px] font-semibold text-gray-800">
                {l.level}
              </span>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-gray-100">
                <div
                  className="flex h-full items-center justify-end pr-2 rounded-md"
                  style={{
                    width: `${l.percent}%`,
                    background: l.color,
                  }}
                >
                  <span className="text-[11px] font-bold text-white">
                    {l.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Table */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-[15px] font-bold text-gray-800">
          🔥 今日待跟进客户 TOP5
        </h3>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-2 py-2.5 text-left font-semibold text-gray-500">
                客户
              </th>
              <th className="px-2 py-2.5 text-left font-semibold text-gray-500">
                等级
              </th>
              <th className="px-2 py-2.5 text-left font-semibold text-gray-500">
                最后联系
              </th>
              <th className="px-2 py-2.5 text-left font-semibold text-gray-500">
                跟进建议
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c.id}
                className="border-b border-gray-100 last:border-b-0"
              >
                <td className="px-2 py-2.5 font-semibold text-gray-800">
                  {c.name}
                </td>
                <td className="px-2 py-2.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      c.level === 'S'
                        ? 'bg-red-50 text-red-500'
                        : c.level === 'A'
                        ? 'bg-orange-50 text-orange-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {c.level}级
                  </span>
                </td>
                <td className="px-2 py-2.5 text-gray-500">{c.lastActive}</td>
                <td className="px-2 py-2.5 text-xs text-gray-600">
                  {c.dailySummaries[0]?.suggestion?.substring(0, 35) ?? '-'}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
