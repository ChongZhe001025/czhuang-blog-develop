# Content structure

- `writing/articles/` contains the Markdown source for all articles linked from the Writing page.
- `writing/archive/` contains older notes that are not included in the Writing list or generated as pages.
- `portfolio/drafts/` contains editorial drafts for the FluxSeer organization profile.

Writing metadata, category, and ordering live in `src/data/writingArticles.json`. Use `technical` for implementation and troubleshooting articles, or `reflection` for personal perspectives on software and engineering. Each article's `contentFile` points to its English Markdown source, while `contentFileZh` points to the Traditional Chinese version under `writing/articles/zh-Hant/`. Keep both files' executable examples aligned and the slug in that record aligned with the desired page URL.

Markdown files in `static/posts/` support legacy article pages. Their Traditional Chinese companions use the same filename under `static/posts/zh-Hant/`; Gatsby loads both versions into the article page. Keep executable code blocks unchanged and translate prose and diagram labels. New Writing articles belong in `content/writing/articles/` instead.
