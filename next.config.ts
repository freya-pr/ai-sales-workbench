import type { NextConfig } from "next";

const isGithubPages = process.env.DEPLOY_TARGET === "github-pages";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? { output: "export", images: { unoptimized: true }, basePath: "/ai-sales-workbench" }
    : {}),
  reactStrictMode: true,
};

export default nextConfig;
