# CZ-Huang Blog

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

Push a change to `main` or run the **Deploy Gatsby site to GitHub Pages** workflow from the Actions tab. GitHub Actions builds the Gatsby site and publishes the generated `public/` directory to GitHub Pages at [https://blog.czhuang.dev](https://blog.czhuang.dev).

The repository's Pages source should be set to **GitHub Actions**. The workflow sets `SITE_URL` to the custom domain so canonical links and sitemap URLs use the public site address.

## Directory Structure

- `src/components/` - React components
- `src/templates/` - Page templates (blog, note, portfolio)
- `src/pages/` - Static pages
- `src/data/` - Blog data (JSON)
- `static/posts/` - Markdown blog posts
- `static/images/` - Static images
