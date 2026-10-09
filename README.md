# Chongzhe Huang — SRE & Platform Engineering

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

- `content/writing/articles/` - Markdown source for the 13 articles in Writing
- `content/writing/archive/` - Older unpublished notes, kept out of the site
- `content/portfolio/drafts/` - Draft copy and material for the portfolio organization profile
- `static/posts/` - Legacy Markdown pages still served by their existing routes
- `static/images/` - Profile, case-study, and site images
- `src/data/site.json` - Site metadata, navigation, and social links
- `src/data/posts.json` - Legacy post metadata used by existing pages
- `src/data/writingArticles.json` - Writing titles, summaries, topics, ordering, and Markdown paths
- `src/data/work.js` / `src/data/portfolio.js` - Work case studies and personal projects
- `src/data/archive/backup.json` - Unused historical data snapshot
- `src/i18n/` - Traditional Chinese UI, article, and case-study translations
- `src/components/` - Shared React components
- `src/templates/` - Writing, Work, Portfolio, and About page templates
- `src/pages/` - Standalone pages
- `src/styles/` - Global styles

### Add a Writing article

1. Add its Markdown file to `content/writing/articles/`.
2. Add the title, summary, topic, priority, rank, slug, and `contentFile` path to `src/data/writingArticles.json`.
3. Add Traditional Chinese title and summary strings to `src/i18n/LanguageContext.js`. Add body translations to `src/i18n/articleTranslations.js` when a Chinese article version is ready.

The Gatsby page routes are generated from `writingArticles.json`; no route needs to be added by hand.
