'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { useSupabaseConfig } from '@/lib/supabase-config-inject';
import { getSupabaseBrowserClientWithRetry } from '@/lib/supabase-browser';

const APP_ICON_URL = '/app-icon.png';
const APP_NAME = '教育AI销售助手工作台';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const { isLoading: configLoading } = useSupabaseConfig();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    if (configLoading) return;
    getSupabaseBrowserClientWithRetry()
      .then(async (supabase) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/');
        }
      })
      .catch(() => {});
  }, [configLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message || '邮箱或密码错误');
        return;
      }

      if (data.session) {
        router.replace('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('请输入邮箱和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要 6 位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      const supabase = await getSupabaseBrowserClientWithRetry();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || '注册失败，请重试');
        return;
      }

      // mailer_auto_confirm is true, so signup auto-confirms and session is created
      if (data.session) {
        router.replace('/');
      } else {
        // If no session, try to login directly
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) {
          setError('注册成功，请登录');
          setMode('login');
        } else {
          router.replace('/');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (configLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 50%, #14b8a6 100%)' }}>
      <div className="w-full max-w-[400px]">
        {/* App Icon & Name */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-3 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
            <img src={APP_ICON_URL} alt={APP_NAME} className="h-20 w-20 object-cover" />
          </div>
          <h1 className="text-[22px] font-bold text-white">{APP_NAME}</h1>
          <p className="mt-1 text-[13px] text-white/70">家庭教育规划课程行业</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl bg-white p-7 shadow-xl" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
          {/* Tab Switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[14px] font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#0891b2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <LogIn className="h-4 w-4" />
              登录
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-[14px] font-medium transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#0891b2] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              注册
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-3 text-[14px] outline-none transition-colors focus:border-[#0891b2] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-10 text-[14px] outline-none transition-colors focus:border-[#0891b2] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                {loading ? '登录中...' : '登 录'}
              </button>

              <div className="pt-1 text-center text-[13px] text-gray-500">
                还没有账号？
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="ml-1 font-medium text-[#0891b2] hover:underline"
                >
                  去注册
                </button>
              </div>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-3 text-[14px] outline-none transition-colors focus:border-[#0891b2] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位"
                    className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-10 text-[14px] outline-none transition-colors focus:border-[#0891b2] focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-gray-700">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full rounded-lg border border-gray-200 bg-slate-50 py-2.5 pl-10 pr-3 text-[14px] outline-none transition-colors focus:border-[#0891b2] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[14px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)' }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                {loading ? '注册中...' : '注 册'}
              </button>

              <div className="pt-1 text-center text-[13px] text-gray-500">
                已有账号？
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); }}
                  className="ml-1 font-medium text-[#0891b2] hover:underline"
                >
                  去登录
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[12px] text-white/50">
          智能教育 · AI 销售工作台 © 2025
        </p>
      </div>
    </div>
  );
}
