#!/usr/bin/env bash
set -euo pipefail

### Config（必要時自行調整）
REPO_URL="git@github.com:ChongZhe001025/czhuang-blog.git"
BRANCH="main"

### 進階：是否加上 Node deprecation 參數（2 擇 1；預設都不加）
# export NODE_OPTIONS="--trace-deprecation"
# export NODE_OPTIONS="--no-deprecation"

### 取得腳本所在目錄（專案根目錄）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

### 檢查 Gatsby CLI 或用 npx 代替
if command -v gatsby >/dev/null 2>&1; then
  GATSBY_CMD="gatsby"
else
  echo "⚠️  Gatsby CLI 未安裝，改用 npx gatsby"
  GATSBY_CMD="npx gatsby"
fi

### 清理與建置
echo "🧹 清理快取：${GATSBY_CMD} clean"
# gatsby 有時會清不掉 .cache（鎖檔），加一層保險手動 rm
rm -rf "${SCRIPT_DIR}/.cache" "${SCRIPT_DIR}/public" || true
${GATSBY_CMD} clean || true  # clean 失敗通常無礙，已 rm -rf 做保險

echo "🏗️  建置：${GATSBY_CMD} build"
${GATSBY_CMD} build

### 清掉暫時環境變數（若有設定）
unset NODE_OPTIONS || true

### 進入 public 目錄
PUBLIC_PATH="${SCRIPT_DIR}/public"
if [[ ! -d "${PUBLIC_PATH}" ]]; then
  echo "❌ 找不到 public 目錄：${PUBLIC_PATH}" >&2
  exit 1
fi
cd "${PUBLIC_PATH}"

### 初始化 Git（若尚未）
if [[ ! -d ".git" ]]; then
  echo "🔧 初始化 Git 倉庫（public/.git）"
  git init
  git remote add origin "${REPO_URL}"
fi

### 取得遠端資料、切換/建立 main
git fetch origin || true
git checkout -B "${BRANCH}"

### 提交並強制推送
git add .
if ! git diff --cached --quiet; then
  git commit -m "Update blog"
else
  echo "ℹ️  沒有變更可提交。"
fi
echo "⬆️  推送到 ${REPO_URL} (${BRANCH})"
git push -f origin "${BRANCH}"

echo "✅ Deployment completed successfully!"

# 給執行權限
# chmod +x ./update_blog.sh
# 執行
# ./update_blog.sh

