'use client';

import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { funnelData, teamStats } from '@/lib/mock-data';

export function SalesDashboardView() {
  const totalDeals = teamStats.reduce((sum, s) => sum + s.deals, 0);
  const totalAmount = teamStats.reduce((sum, s) => sum + s.amount, 0);
  const avgConversion =
    teamStats.reduce((sum, s) => sum + s.conversionRate, 0) / teamStats.length;

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">销售看板</h1>
          <p className="mt-1 text-sm text-slate-500">
            转化漏斗、人效统计与成交分析
          </p>
        </div>

        {/* Overview Stats */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: '本月成交单数', value: totalDeals.toString(), icon: Target, color: 'text-[#0891b2]', bgColor: 'bg-[#ecfeff]' },
            { label: '本月成交金额', value: `¥${(totalAmount / 10000).toFixed(1)}万`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
            { label: '平均转化率', value: `${avgConversion.toFixed(1)}%`, icon: TrendingUp, color: 'text-[#8b5cf6]', bgColor: 'bg-[#8b5cf6]/5' },
            { label: '活跃销售', value: teamStats.length.toString(), icon: Users, color: 'text-amber-600', bgColor: 'bg-amber-50' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div className={cn('rounded-lg p-2', stat.bgColor)}>
                  <stat.icon className={cn('h-5 w-5', stat.color)} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-900">
                {stat.value}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0891b2]" />
              <h2 className="text-base font-semibold text-slate-900">
                转化漏斗
              </h2>
            </div>
            <div className="space-y-3">
              {funnelData.map((stage, idx) => (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-slate-700">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">
                        {stage.count}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({stage.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 w-full overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className="absolute left-0 top-0 h-full rounded-lg transition-all"
                      style={{
                        width: `${stage.percentage}%`,
                        background: `linear-gradient(90deg, #0891b2, #06b6d4)`,
                        opacity: 1 - idx * 0.12,
                      }}
                    />
                    <div className="relative flex h-full items-center px-3">
                      {idx < funnelData.length - 1 && (
                        <span className="text-xs font-medium text-white/90">
                          {funnelData[idx + 1].percentage}% 进入下一步
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats & Ranking */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h2 className="text-base font-semibold text-slate-900">
                  销售排行
                </h2>
              </div>
              <div className="space-y-3">
                {teamStats.map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold',
                        member.rank === 1
                          ? 'bg-amber-100 text-amber-700'
                          : member.rank === 2
                          ? 'bg-slate-100 text-slate-600'
                          : member.rank === 3
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-slate-50 text-slate-400'
                      )}
                    >
                      {member.rank}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-900">
                          {member.name}
                        </span>
                        <span className="text-sm font-semibold text-[#0891b2]">
                          ¥{(member.amount / 10000).toFixed(1)}万
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        <span>成交 {member.deals} 单</span>
                        <span>转化率 {member.conversionRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Efficiency Analysis */}
            <div className="rounded-xl border border-[#0891b2]/20 bg-[#ecfeff] p-5">
              <h3 className="mb-3 text-sm font-semibold text-[#0891b2]">
                人效分析
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/70 p-3">
                  <p className="text-xs text-slate-500">人均日处理会话</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">5.8</p>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <p className="text-xs text-slate-500">人均日成交金额</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">
                    ¥{(totalAmount / teamStats.length / 30 / 10000).toFixed(2)}万
                  </p>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <p className="text-xs text-slate-500">AI 辅助提升</p>
                  <p className="mt-1 text-lg font-bold text-green-600">+32%</p>
                </div>
                <div className="rounded-lg bg-white/70 p-3">
                  <p className="text-xs text-slate-500">平均跟进周期</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">3.2天</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
