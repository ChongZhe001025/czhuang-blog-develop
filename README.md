# CZ Blog

A personal blog and portfolio site built with Gatsby.

## Features

- Blog posts and notes in Markdown
- Portfolio templates
- Pagination and navigation
- MDX support
- PWA ready (manifest, offline)
- Image optimization
- Customizable site config

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run develop
   ```
   Visit [http://localhost:8000](http://localhost:8000)

3. Build for production:
   ```bash
   npm run build
   ```

## Deployment

- Use `update_blog.ps1` (Windows) or `update_blog.sh` (Linux) to build and deploy the site to GitHub.

## Directory Structure

- `src/components/` - React components
- `src/templates/` - Page templates (blog, note, portfolio)
- `src/pages/` - Static pages
- `src/data/` - Blog data (JSON)
- `static/posts/` - Markdown blog posts
- `static/images/` - Static images