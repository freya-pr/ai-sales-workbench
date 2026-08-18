import type { Metadata } from 'next';
import './globals.css';
import { SupabaseConfigProvider } from '@/lib/supabase-config-inject';

export const metadata: Metadata = {
  title: 'AI 销售工作台 - 智学教育',
  description: '面向家庭教育规划课程行业的AI销售工作台，提升客户转化效率',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <SupabaseConfigProvider>
          {children}
        </SupabaseConfigProvider>
      </body>
    </html>
  );
}
