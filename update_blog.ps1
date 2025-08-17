# Ensure Gatsby CLI is available
if (-not (Get-Command gatsby -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Gatsby CLI is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Clean and build Gatsby project
gatsby clean
gatsby build

# Change to public directory (modify to your correct path)
Set-Location "$PSScriptRoot\public"

# Initialize Git repository
if (-not (Test-Path ".git")) {
    git init
    git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git
}

# Fetch remote repository data
git fetch origin

# Set branch name
git branch -M main

# Add changes
git add .

# Commit changes
git commit -m "Update blog"

# Force push to remote repository
git push -f origin main

Write-Host "Deployment completed successfully!" -ForegroundColor Green

# powershell -ExecutionPolicy Bypass -File update_blog.ps1