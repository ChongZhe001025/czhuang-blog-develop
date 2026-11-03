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

```text
content/
├── writing/
│   ├── articles/          Published Writing Markdown and zh-Hant companions
│   └── archive/            Older notes kept out of the public site
├── work/                  Published Work case studies and zh-Hant companions
└── portfolio/
    ├── *.md                Published Portfolio case studies
    ├── zh-Hant/            Traditional Chinese Portfolio content
    └── drafts/              Unpublished editorial drafts

src/
├── data/                  Metadata catalogs and legacy source data
│   ├── work.js             Work listing metadata and content paths
│   ├── portfolio.js        Portfolio listing metadata and content paths
│   ├── writingArticles.json Writing listing metadata and content paths
│   ├── site.json           Site metadata, navigation, and social links
│   ├── posts.json          Legacy post metadata
│   └── archive/             Unused historical snapshots
├── components/             Shared React components
├── pages/                  Standalone pages and Work listing page
├── templates/              Gatsby page templates
├── i18n/                   UI and legacy article fallback translations
├── styles/                 Global styles
└── utils/                  Shared helpers

static/
├── images/                 Profile, case-study, and site images
└── posts/                  Legacy Markdown pages still served by existing routes
```

Content ownership is intentionally split:

- Writing metadata lives in `src/data/writingArticles.json`; full content lives in `content/writing/articles/`.
- Work metadata lives in `src/data/work.js`; full content lives in `content/work/`.
- Portfolio metadata lives in `src/data/portfolio.js`; full content lives in `content/portfolio/`.
- `content/**/drafts/`, `content/writing/archive/`, `static/posts/`, and `src/data/archive/` are not part of the new published-content workflow.
- `public/` and `.cache/` are Gatsby-generated directories and should not be edited manually.

### Add a Writing article

1. Add its Markdown file to `content/writing/articles/`.
2. Add its Traditional Chinese body to `content/writing/articles/zh-Hant/<slug>.zh-Hant.md`; keep executable examples consistent and translate labels in diagrams.
3. Add the title, summary, topic, category (`technical` or `reflection`), priority, rank, slug, `contentFile`, and `contentFileZh` paths to `src/data/writingArticles.json`.
4. Add Traditional Chinese title and summary strings to `src/i18n/LanguageContext.js`.

Legacy Markdown pages under `static/posts/` use a same-named translation under `static/posts/zh-Hant/`. Keep fenced executable examples identical; translate prose and human-readable diagram labels. `src/i18n/articleTranslations.js` is a fallback for older pages without a companion file.

The Gatsby page routes are generated from `writingArticles.json`; no route needs to be added by hand.

### Add a Work or Portfolio case study

1. Add the English Markdown file under `content/work/` or `content/portfolio/`.
2. Add the Traditional Chinese companion under the matching `zh-Hant/` directory.
3. Add or update the listing metadata and the `contentFile` / `contentFileZh` paths in `src/data/work.js` or `src/data/portfolio.js`.
4. Keep company-specific identifiers, private infrastructure details, account IDs, and internal URLs out of public content.
