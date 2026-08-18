'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Sparkles, BarChart3, MessageSquare, LogOut, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatView } from './chat-view';
import { InsightsView } from './tabs/ai-insights';
import { CopilotView } from './tabs/ai-copilot';
import { DashboardView } from './tabs/sales-dashboard';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

type TabId = 'chat' | 'insights' | 'copilot' | 'dashboard';

const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'insights', label: 'AI 洞察', icon: Brain },
  { id: 'chat', label: '客户画像', icon: MessageSquare },
  { id: 'copilot', label: 'AI 副驾', icon: Sparkles },
  { id: 'dashboard', label: '销售看板', icon: BarChart3 },
];

export default function Home() {
  const router = useRouter();
  const { isLoading: configLoading } = useSupabaseConfig();
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [isAiMode, setIsAiMode] = useState(true);
  const [notificationCount] = useState(5);

  // Auth state
  const [authChecking, setAuthChecking] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (configLoading) return;

    getSupabaseBrowserClientWithRetry()
      .then(async (supabase) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
        setAuthChecking(false);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [configLoading, router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      await supabase.auth.signOut();
      router.replace('/login');
    } catch {
      router.replace('/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  // Show loading while checking auth
  if (configLoading || authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0891b2]" />
          <p className="text-[14px] text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8fafc] text-gray-800">
      {/* Top Navigation */}
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

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 rounded-full bg-white/[0.12] px-3 py-1.5 transition-all hover:bg-white/20"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[13px] font-semibold">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                  <div className="border-b border-gray-100 px-4 pb-2">
                    <p className="text-[13px] font-medium text-gray-800">当前账号</p>
                    <p className="truncate text-[12px] text-gray-500">{userEmail}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    退出登录
                  </button>
                </div>
              </>
            )}
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" onClick={() => setShowLogoutConfirm(false)}>
          <div className="w-[360px] rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                <LogOut className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-800">退出登录</h3>
            </div>
            <p className="mb-5 text-[14px] text-gray-500">确定要退出当前账号吗？退出后需要重新登录。</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-[14px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-500 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {loggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loggingOut ? '退出中...' : '确定退出'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
