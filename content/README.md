# Content structure

- `writing/articles/` contains the Markdown source for all articles linked from the Writing page.
- `writing/archive/` contains older notes that are not included in the Writing list or generated as pages.
- `portfolio/drafts/` contains editorial drafts for the FluxSeer organization profile.

Writing metadata and ordering live in `src/data/writingArticles.json`. Each article's `contentFile` points to its Markdown source. Keep the slug in that record aligned with the desired page URL.

The remaining Markdown files in `static/posts/` support legacy pages and are served as static assets. New Writing articles belong in `content/writing/articles/` instead.
