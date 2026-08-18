import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare global {
  interface Window {
    __SUPABASE_CONFIG__?: {
      url: string;
      anonKey: string;
    };
  }
}

const SUPABASE_CONFIG_READY_EVENT = 'supabase-config-ready';

let browserClient: SupabaseClient | null = null;

// 构建时注入的公开配置（静态导出兜底）
const BUILTIN_PUBLIC_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};

function ensureConfigOnWindow(): boolean {
  if (window.__SUPABASE_CONFIG__?.url && window.__SUPABASE_CONFIG__?.anonKey) {
    return true;
  }
  if (BUILTIN_PUBLIC_CONFIG.url && BUILTIN_PUBLIC_CONFIG.anonKey) {
    window.__SUPABASE_CONFIG__ = { ...BUILTIN_PUBLIC_CONFIG };
    window.dispatchEvent(
      new CustomEvent(SUPABASE_CONFIG_READY_EVENT, { detail: window.__SUPABASE_CONFIG__ })
    );
    return true;
  }
  return false;
}

function waitForConfig(maxWait = 5000): Promise<boolean> {
  if (ensureConfigOnWindow()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let resolved = false;

    const handler = () => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener(SUPABASE_CONFIG_READY_EVENT, handler);
        resolve(true);
      }
    };

    window.addEventListener(SUPABASE_CONFIG_READY_EVENT, handler);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener(SUPABASE_CONFIG_READY_EVENT, handler);
        resolve(ensureConfigOnWindow());
      }
    }, maxWait);
  });
}

function isConfigReady(): boolean {
  return ensureConfigOnWindow();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClient === null) {
    if (!ensureConfigOnWindow()) {
      throw new Error(
        'Supabase config not found. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set at build time.'
      );
    }
    const config = window.__SUPABASE_CONFIG__!;

    browserClient = createClient(config.url, config.anonKey, {
      db: {
        timeout: 60000,
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    });
  }

  return browserClient;
}

async function getSupabaseBrowserClientWithRetry(maxRetries = 5, retryInterval = 1000): Promise<SupabaseClient> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return getSupabaseBrowserClient();
    } catch {
      if (i < maxRetries - 1) {
        await sleep(retryInterval);
      }
    }
  }
  return getSupabaseBrowserClient();
}

async function getSupabaseBrowserClientAsync(): Promise<SupabaseClient> {
  if (browserClient !== null) {
    return browserClient;
  }

  const ready = await waitForConfig();
  if (!ready) {
    throw new Error(
      'Supabase config not found after waiting. Make sure SupabaseConfigProvider is included in your layout.tsx'
    );
  }

  return getSupabaseBrowserClient();
}

export { getSupabaseBrowserClient, getSupabaseBrowserClientWithRetry, getSupabaseBrowserClientAsync, waitForConfig, isConfigReady };
