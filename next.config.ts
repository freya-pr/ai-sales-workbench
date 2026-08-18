import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ai-sales-workbench',
  env: {
    NEXT_PUBLIC_BASE_PATH: '/ai-sales-workbench',
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.dev.coze.site'],
};

export default nextConfig;
