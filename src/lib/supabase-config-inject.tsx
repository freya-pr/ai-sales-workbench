'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface SupabaseConfigContextType {
  config: SupabaseConfig | null;
  isLoading: boolean;
  error: string | null;
}

const SupabaseConfigContext = createContext<SupabaseConfigContextType>({
  config: null,
  isLoading: true,
  error: null,
});

export const SUPABASE_CONFIG_READY_EVENT = 'supabase-config-ready';

export function useSupabaseConfig() {
  return useContext(SupabaseConfigContext);
}

interface SupabaseConfigProviderProps {
  children: ReactNode;
}

export function SupabaseConfigProvider({ children }: SupabaseConfigProviderProps) {
  const [config, setConfig] = useState<SupabaseConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 优先使用构建时注入的公开环境变量（静态导出版本）
    // anon key 是公开的，硬编码兜底确保 widget 在任何环境都能连接
    const FALLBACK = {
      url: 'https://br-prime-rook-1c727bd5.supabase2.aidap-global.cn-beijing.volces.com',
      anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjMzNjc2NjE1NjIsInJvbGUiOiJhbm9uIn0.2bOeBjxKmzUh307lVi2hRtNqCH4LMb949lYaIDoq3uE',
    };
    const builtinUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK.url;
    const builtinKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK.anonKey;

    if (builtinUrl && builtinKey) {
      const cfg = { url: builtinUrl, anonKey: builtinKey };
      setConfig(cfg);
      (window as unknown as { __SUPABASE_CONFIG__: SupabaseConfig }).__SUPABASE_CONFIG__ = cfg;
      window.dispatchEvent(new CustomEvent(SUPABASE_CONFIG_READY_EVENT, { detail: cfg }));
      setIsLoading(false);
      return;
    }

    // 兜底：从 API 获取（SSR/服务端渲染版本）
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // 静态导出兜底：优先尝试 .json 后缀（GitHub Pages 对无扩展名文件可能返回 octet-stream）
    const tryFetch = (url: string) =>
      fetch(url, { headers: { Accept: 'application/json' } }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
    tryFetch(`${basePath}/api/supabase-config.json`)
      .catch(() => tryFetch(`${basePath}/api/supabase-config`))
      .then((data) => {
        if (data.url && data.anonKey) {
          setConfig(data);
          (window as unknown as { __SUPABASE_CONFIG__: SupabaseConfig }).__SUPABASE_CONFIG__ = data;
          window.dispatchEvent(new CustomEvent(SUPABASE_CONFIG_READY_EVENT, { detail: data }));
        } else {
          throw new Error('Invalid config response');
        }
      })
      .catch((err) => {
        setError(err.message);
        console.error('Failed to load Supabase config:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SupabaseConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </SupabaseConfigContext.Provider>
  );
}
