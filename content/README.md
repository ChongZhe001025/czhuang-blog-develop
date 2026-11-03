# Content structure

- `writing/articles/` contains the Markdown source for all articles linked from the Writing page.
- `work/` contains the published Work case-study Markdown, with Traditional Chinese companions under `work/zh-Hant/`.
- `portfolio/` contains the published Portfolio case-study Markdown, with Traditional Chinese companions under `portfolio/zh-Hant/`.
- `writing/archive/` contains older notes that are not included in the Writing list or generated as pages.
- `portfolio/drafts/` contains editorial drafts for the FluxSeer organization profile.

Writing metadata, category, and ordering live in `src/data/writingArticles.json`. Use `technical` for implementation and troubleshooting articles, or `reflection` for personal perspectives on software and engineering. Each article's `contentFile` points to its English Markdown source, while `contentFileZh` points to the Traditional Chinese version under `writing/articles/zh-Hant/`. Keep both files' executable examples aligned and the slug in that record aligned with the desired page URL.

Portfolio metadata lives in `src/data/portfolio.js`. Keep project identity, listing metadata, and repository links there; place the full case-study prose in each project's `contentFile` and `contentFileZh`. Files under `portfolio/drafts/` are editorial drafts and are not read by the public Portfolio routes.

Work metadata lives in `src/data/work.js`. Keep listing metadata, status, technology, and featured flags there; place each case study's full English and Traditional Chinese content in its `contentFile` and `contentFileZh`.

Markdown files in `static/posts/` support legacy article pages. Their Traditional Chinese companions use the same filename under `static/posts/zh-Hant/`; Gatsby loads both versions into the article page. Keep executable code blocks unchanged and translate prose and diagram labels. New Writing articles belong in `content/writing/articles/` instead.
