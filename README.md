# In Context

Personal blog. Markdown in, static site out.

## Run

```
npm start          # build + serve at http://localhost:5173
npm run build      # build only (writes public/posts.js)
```

No `npm install` needed — zero dependencies. React, ReactDOM, and Babel
are loaded over a CDN by `public/index.html`.

## Adding a post

Drop a markdown file anywhere under `content/posts/`. The directory tree is
purely organizational — what the UI groups by is the `category` frontmatter
key, not the folder.

```
content/posts/personal/education-in-the-age-of-ai.md
content/posts/agentic-ai/your-next-essay.md
```

Each file looks like:

```markdown
---
id: education-in-the-age-of-ai
title: Education in the age of AI
category: Personal
date: 2026-05-20
readTime: 9 min
excerpt: One-sentence pitch shown in the post list.
---

Opening paragraph. Plain prose.

## A section heading

More prose. *Italics* and **bold** work. `_underscore italics_` too.

> A line starting with `> ` becomes a pull quote.
```

Supported categories (must match for filtering to pick them up):
`Thoughts`, `Agentic AI`, `Safety`, `Personal`.

The build script keeps everything sortable by `date`. Use ISO format
(`YYYY-MM-DD`) and the build will render it as `May 20, 2026`.

## Layout

```
field-notes/
├── content/posts/      # source of truth — markdown files
├── public/             # the static site
│   ├── index.html
│   ├── styles.css
│   ├── app.jsx         # React app (Babel-compiled in the browser)
│   ├── tweaks-panel.jsx
│   └── posts.js        # GENERATED — do not edit
├── build.js            # walks content/, writes public/posts.js
├── serve.js            # dev server, rebuilds on each /posts.js request
└── package.json
```

## Deploying

`public/` is fully self-contained after a build. Upload it to any static host
(Netlify, GitHub Pages, S3, Cloudflare Pages) and you're done. Run
`npm run build` first.
