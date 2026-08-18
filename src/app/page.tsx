'use client';

import { useState } from 'react';
import {
  BarChart3,
  Brain,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WorkspaceView } from './workspace-view';
import { AIInsightsView } from './tabs/ai-insights';
import { CustomerManagementView } from './tabs/customer-management';
import { AICopilotView } from './tabs/ai-copilot';
import { SalesDashboardView } from './tabs/sales-dashboard';

const tabs = [
  { id: 'workspace', label: '工作台', icon: MessageSquare },
  { id: 'insights', label: 'AI 洞察', icon: Brain },
  { id: 'customers', label: '客户画像管理', icon: Users },
  { id: 'copilot', label: 'AI 副驾', icon: Sparkles },
  { id: 'dashboard', label: '销售看板', icon: BarChart3 },
] as const;

type TabId = (typeof tabs)[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('workspace');

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Top Navigation */}
      <header className="flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-6">
        <div className="flex items-center gap-2 mr-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0891b2]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-semibold text-slate-900">
            智学教育
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-[#ecfeff] text-[#0891b2]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs text-slate-600">在线</span>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0891b2] text-xs font-medium text-white">
            杨
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'workspace' && <WorkspaceView />}
        {activeTab === 'insights' && <AIInsightsView />}
        {activeTab === 'customers' && <CustomerManagementView />}
        {activeTab === 'copilot' && <AICopilotView />}
        {activeTab === 'dashboard' && <SalesDashboardView />}
      </main>
    </div>
  );
}
