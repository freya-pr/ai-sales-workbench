'use client';

import { useState } from 'react';
import { Brain, Sparkles, BarChart3, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatView } from './chat-view';
import { InsightsView } from './tabs/ai-insights';
import { CopilotView } from './tabs/ai-copilot';
import { DashboardView } from './tabs/sales-dashboard';

type TabId = 'chat' | 'insights' | 'copilot' | 'dashboard';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'insights', label: 'AI 洞察', icon: Brain },
  { id: 'chat', label: '客户画像', icon: MessageSquare },
  { id: 'copilot', label: 'AI 副驾', icon: Sparkles },
  { id: 'dashboard', label: '销售看板', icon: BarChart3 },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [isAiMode, setIsAiMode] = useState(true);
  const [notificationCount] = useState(5);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc] text-gray-800">
      {/* Top Navigation - gradient matching prototype */}
      <header
        className="flex h-14 shrink-0 items-center justify-between px-6 text-white z-50"
        style={{
          background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #14b8a6 100%)',
          boxShadow: '0 2px 8px rgba(8,145,178,0.3)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-lg backdrop-blur-sm">
            🎯
          </div>
          <span className="text-[17px] font-bold tracking-wide">AI 销售工作台</span>
          <span className="ml-2 text-[11px] font-normal text-white/75">家庭教育规划</span>
        </div>

        <nav className="flex gap-0.5 rounded-[10px] bg-white/10 p-[3px]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-5 py-[7px] text-[13.5px] font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-white/[0.22] font-semibold text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer text-xl opacity-90">
            🔔
            {notificationCount > 0 && (
              <span className="absolute -right-1.5 -top-1 rounded-full bg-red-500 px-[5px] py-[1px] text-[10px] font-semibold text-white">
                {notificationCount}
              </span>
            )}
          </div>
          <div
            className={cn(
              'flex cursor-pointer select-none items-center gap-2 rounded-full px-3.5 py-[5px] transition-all',
              'bg-white/[0.12] hover:bg-white/20'
            )}
            onClick={() => setIsAiMode(!isAiMode)}
          >
            <span className="min-w-[48px] text-center text-[12.5px] font-medium">
              {isAiMode ? 'AI 模式' : '人工模式'}
            </span>
            <div
              className={cn(
                'relative h-5 w-9 rounded-full transition-all',
                isAiMode ? 'bg-[#5eead4]' : 'bg-white/30'
              )}
            >
              <div
                className={cn(
                  'absolute top-[2px] h-4 w-4 rounded-full shadow-md transition-all',
                  isAiMode ? 'left-[18px] bg-[#0e7490]' : 'left-[2px] bg-white'
                )}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {activeTab === 'chat' && <ChatView isAiMode={isAiMode} />}
        {activeTab === 'insights' && <InsightsView />}
        {activeTab === 'copilot' && <CopilotView />}
        {activeTab === 'dashboard' && <DashboardView />}
      </main>
    </div>
  );
}
