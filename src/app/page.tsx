'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Sparkles, BarChart3, MessageSquare, LogOut, Loader2, ChevronDown, Share2, X, Copy, Check, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatView } from './chat-view-real';
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
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    }
  };

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

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-white/[0.15] px-3 py-1.5 text-[12.5px] font-medium text-white transition hover:bg-white/25"
            title="获取客户咨询入口"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">客户入口</span>
          </button>
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

      {/* Share / Customer Entry Modal */}
      {showShareModal && (
        <ShareModal
          onClose={() => setShowShareModal(false)}
          onCopy={copyToClipboard}
          copied={copied}
        />
      )}

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

function getOrigin(): string {
  if (typeof window === 'undefined') return '';
  // 优先使用 Vercel 生产域名（如果当前是 GitHub Pages 预览也切到 Vercel）
  const host = window.location.hostname;
  if (host.includes('github.io') || host.includes('localhost') || host.includes('127.0.0.1')) {
    return 'https://ai-sales-workbench-liart.vercel.app';
  }
  return window.location.origin;
}

function ShareModal({
  onClose,
  onCopy,
  copied,
}: {
  onClose: () => void;
  onCopy: (text: string, key: string) => void;
  copied: string | null;
}) {
  const origin = getOrigin();
  const landingLink = `${origin}/chat?ref=sales_share`;
  const widgetLink = `${origin}/widget?auto=1&ref=sales_share`;
  const embedCode = `<script>\n  window.CHAT_WIDGET_CONFIG = {\n    title: '课程顾问',\n    primaryColor: '#0891b2'\n  };\n</script>\n<script src="${origin}/chat-widget.js" async></script>`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(
    landingLink
  )}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-cyan-600" />
            <h3 className="text-[15px] font-semibold text-slate-800">客户咨询入口</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4">
          {/* QR Code */}
          <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 p-4">
            <div className="flex h-[130px] w-[130px] shrink-0 items-center justify-center rounded-lg bg-white p-2 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl} alt="咨询入口二维码" className="h-full w-full" width={114} height={114} />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[13px] font-semibold text-slate-800">
                <QrCode className="h-3.5 w-3.5 text-cyan-600" />
                扫码直接咨询
              </div>
              <p className="text-[12px] leading-relaxed text-slate-500">
                将二维码放到海报、朋友圈、公众号菜单或宣传页上，客户扫码即可发起对话，消息实时同步到工作台。
              </p>
            </div>
          </div>

          {/* Landing Link */}
          <FieldRow label="独立咨询页链接" value={landingLink} onCopy={onCopy} copiedKey="landing" copied={copied} />

          {/* Widget Link */}
          <FieldRow label="直接聊天窗口链接" value={widgetLink} onCopy={onCopy} copiedKey="widget" copied={copied} />

          {/* Embed Code */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[12px] font-medium text-slate-600">嵌入到任意网站</label>
              <button
                onClick={() => onCopy(embedCode, 'embed')}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-cyan-600 hover:bg-cyan-50"
              >
                {copied === 'embed' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied === 'embed' ? '已复制' : '复制代码'}
              </button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-[11.5px] leading-relaxed text-slate-100">
              <code>{embedCode}</code>
            </pre>
            <p className="mt-1.5 text-[11px] text-slate-400">
              复制这段代码粘贴到官网 HTML 的 {'</body>'} 标签前即可。
            </p>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-[11.5px] leading-relaxed text-amber-800">
            <strong>工作方式：</strong>客户通过以上任一入口发起对话 → 消息实时推送到你的工作台 →
            AI 自动接待并给出建议，你也可以随时人工接管。无需企业微信备案。
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  value,
  onCopy,
  copiedKey,
  copied,
}: {
  label: string;
  value: string;
  onCopy: (text: string, key: string) => void;
  copiedKey: string;
  copied: string | null;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-slate-600">{label}</label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <code className="flex-1 truncate text-[12px] text-slate-700">{value}</code>
        <button
          onClick={() => onCopy(value, copiedKey)}
          className="flex shrink-0 items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-medium text-cyan-600 ring-1 ring-slate-200 transition hover:bg-cyan-50"
        >
          {copied === copiedKey ? (
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
    </div>
  );
}
