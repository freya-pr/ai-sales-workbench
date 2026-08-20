#!/usr/bin/env bash
# 静态构建（GitHub Pages）：临时隐藏所有需要 Node.js 运行时的 API 路由
# Vercel 构建不走此脚本，保留全部 API 路由
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$ROOT/src/app/api"
HIDDEN_DIR="$ROOT/.api-hidden"

if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$HIDDEN_DIR"
  echo "[static-build] hid src/app/api (all routes)"
  # 占位：避免 import 引用报错（静态版不需要 API）
  mkdir -p "$API_DIR"
  cat > "$API_DIR/.gitkeep" <<'EOF'
# Hidden during static build. Do not commit.
EOF
fi

cleanup() {
  if [ -d "$HIDDEN_DIR" ]; then
    rm -rf "$API_DIR"
    mv "$HIDDEN_DIR" "$API_DIR"
    echo "[static-build] restored src/app/api"
  fi
}
trap cleanup EXIT INT TERM

# 清理 .next 缓存
rm -rf .next out

pnpm next build

# 后处理：GitHub Pages 对无扩展名文件可能返回 octet-stream
# 把 supabase-config 复制一份 .json 版本（如果静态版仍有此路由）
if [ -f "out/api/supabase-config" ]; then
  cp "out/api/supabase-config" "out/api/supabase-config.json"
  echo "[static-build] generated out/api/supabase-config.json"
fi

# 确保 WW_verify 文件可访问（同时保留无扩展名和 .txt 两种）
if [ -f "out/WW_verify_BFhe0y19NFsu0ytH" ]; then
  cp "out/WW_verify_BFhe0y19NFsu0ytH" "out/WW_verify_BFhe0y19NFsu0ytH.txt" 2>/dev/null || true
fi

echo "[static-build] done"

