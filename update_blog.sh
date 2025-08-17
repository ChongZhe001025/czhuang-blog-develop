#!/bin/bash
# Ensure Gatsby CLI is available
if ! command -v gatsby &> /dev/null; then
  echo "Error: Gatsby CLI is not installed or not in PATH." >&2
  exit 1
fi

# Clean and build Gatsby project
gatsby clean
gatsby build

# Navigate to public directory (modify to your correct path)
cd "$(dirname "$0")/public"

# Initialize Git repository
if [ ! -d .git ]; then
  git init
  git remote add origin https://github.com/ChongZhe001025/czhuang-blog.git
fi

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

echo "Deployment completed successfully!"
