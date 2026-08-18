#!/usr/bin/env bash
# 临时隐藏需要 Node.js 服务端的 API 路由，构建静态版本后自动恢复
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WECOM_DIR="$ROOT/src/app/api/wecom"
HIDDEN_DIR="$ROOT/.wecom-hidden"

if [ -d "$WECOM_DIR" ]; then
  mv "$WECOM_DIR" "$HIDDEN_DIR"
  echo "[static-build] hid src/app/api/wecom"
fi

cleanup() {
  if [ -d "$HIDDEN_DIR" ]; then
    mv "$HIDDEN_DIR" "$WECOM_DIR"
    echo "[static-build] restored src/app/api/wecom"
  fi
}
trap cleanup EXIT INT TERM

# 清理 .next 缓存
rm -rf .next out

pnpm next build

# 后处理：GitHub Pages 对无扩展名文件可能返回 octet-stream
# 把 supabase-config 复制一份 .json 版本
if [ -f "out/api/supabase-config" ]; then
  cp "out/api/supabase-config" "out/api/supabase-config.json"
  echo "[static-build] generated out/api/supabase-config.json"
fi

# 确保 WW_verify 文件可访问（同时保留无扩展名和 .txt 两种）
if [ -f "out/WW_verify_BFhe0y19NFsu0ytH" ]; then
  cp "out/WW_verify_BFhe0y19NFsu0ytH" "out/WW_verify_BFhe0y19NFsu0ytH.txt" 2>/dev/null || true
fi

echo "[static-build] done"

