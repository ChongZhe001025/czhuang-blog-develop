# Fail fast on errors
$ErrorActionPreference = "Stop"

# Ensure Gatsby CLI is available
if (-not (Get-Command gatsby -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Gatsby CLI is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# （可選）開啟 deprecation 追蹤或靜音其一
# $env:NODE_OPTIONS = '--trace-deprecation'
# $env:NODE_OPTIONS = '--no-deprecation'

# Clean and build Gatsby project
gatsby clean
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gatsby clean failed with exit code $LASTEXITCODE"
    exit $LASTEXITCODE
}

gatsby build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Gatsby build failed with exit code $LASTEXITCODE"
    # 清掉暫時環境變數（若有設定）
    Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
    exit $LASTEXITCODE
}

# 清掉暫時環境變數（若有設定）
Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue

# Change to public directory (modify to your correct path)
$publicPath = Join-Path $PSScriptRoot 'public'
if (-not (Test-Path $publicPath)) {
    Write-Error "Public folder not found at $publicPath"
    exit 1
}
Set-Location $publicPath

# Initialize Git repository
if (-not (Test-Path ".git")) {
    git init
    git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git
}

git fetch origin
git branch -M main
git add .
git commit -m "Update blog"
git push -f origin main

Write-Host "Deployment completed successfully!" -ForegroundColor Green

#powershell -ExecutionPolicy Bypass -File update_blog.ps1