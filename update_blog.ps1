# 確保 Gatsby CLI 可用
if (-not (Get-Command gatsby -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Gatsby CLI is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 清理並建置 Gatsby 專案
gatsby clean
gatsby build

# 切換到 public 目錄 (修改成你的正確路徑)
Set-Location "$PSScriptRoot\public"

# 檢查 Git 是否安裝
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 初始化 Git 儲存庫
if (-not (Test-Path ".git")) {
    git init
    git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git
}

# 獲取遠端儲存庫資料
git fetch origin

# 設定分支名稱
git branch -M main

# 新增變更
git add .

# 提交變更
git commit -m "Update blog"

# 強制推送到遠端儲存庫
git push -f origin main

Write-Host "Deployment completed successfully!" -ForegroundColor Green

# powershell -ExecutionPolicy Bypass -File update_blog.ps1