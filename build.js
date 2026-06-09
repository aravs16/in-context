#!/usr/bin/env node
// Walks content/posts/**/*.md, parses frontmatter + a tiny subset of Markdown
// (## h2, > pull quote, paragraphs, **bold**, *italic*, _italic_), and writes
// public/posts.js as `window.POSTS = [...]`.
//
// Add a new post: drop a .md file anywhere under content/posts/ and re-run.
// Directories are organizational only — the `category` frontmatter is what
// the UI groups by.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, 'content', 'posts');
const OUT = path.join(__dirname, 'public', 'posts.js');

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.isFile() && e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    let val = line.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    meta[key] = val;
  }
  return { meta, body: m[2] };
}

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]\n]+?)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  s = s.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  s = s.replace(/(^|[^A-Za-z0-9])_([^_\n]+?)_(?=$|[^A-Za-z0-9])/g, '$1<em>$2</em>');
  return s;
}

function parseBody(body) {
  const lines = body.split(/\r?\n/);
  const blocks = [];
  let para = [];
  let codeLines = null;
  let list = null; // { ordered: bool, items: string[] }

  const flushPara = () => {
    if (!para.length) return;
    const text = para.join(' ').trim();
    if (text) blocks.push({ type: 'p', html: renderInline(text) });
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    blocks.push({ type: 'list', ordered: list.ordered, items: list.items });
    list = null;
  };
  const flushAll = () => { flushPara(); flushList(); };

  const ulMatch = (s) => s.match(/^[-*]\s+(.*)$/);
  const olMatch = (s) => s.match(/^\d+\.\s+(.*)$/);

  for (const raw of lines) {
    if (codeLines !== null) {
      if (raw.trim() === '```') {
        blocks.push({ type: 'code', html: escapeHtml(codeLines.join('\n')) });
        codeLines = null;
      } else {
        codeLines.push(raw);
      }
      continue;
    }
    const line = raw.trim();
    if (line.startsWith('```')) {
      flushAll();
      codeLines = [];
      continue;
    }
    if (!line) { flushAll(); continue; }
    if (line.startsWith('## ')) {
      flushAll();
      blocks.push({ type: 'h2', html: renderInline(line.slice(3).trim()) });
      continue;
    }
    if (line.startsWith('> ')) {
      flushAll();
      blocks.push({ type: 'pull', html: renderInline(line.slice(2).trim()) });
      continue;
    }
    const um = ulMatch(line);
    const om = olMatch(line);
    if (um || om) {
      flushPara();
      const ordered = !!om;
      const text = (um ? um[1] : om[1]).trim();
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(renderInline(text));
      continue;
    }
    flushList();
    para.push(line);
  }
  flushAll();
  if (codeLines !== null) {
    blocks.push({ type: 'code', html: escapeHtml(codeLines.join('\n')) });
  }
  return blocks;
}

function formatDate(s) {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return s;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m[2] - 1]} ${+m[3]}, ${m[1]}`;
}

function buildPost(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const { meta, body } = parseFrontmatter(raw);
  const id = meta.id || path.basename(file, '.md');
  return {
    id,
    title: meta.title || id,
    category: meta.category || 'Thoughts',
    date: formatDate(meta.date || ''),
    _sortDate: meta.date || '',
    readTime: meta.readTime || '5 min',
    excerpt: meta.excerpt || '',
    banner: meta.banner || '',
    bannerAlt: meta.bannerAlt || '',
    ogImage: meta.ogImage || '',
    body: parseBody(body),
  };
}

const SITE_URL = 'https://www.incontext.sh';
const AUTHOR = 'Aravind Singirikonda';
const SITE_NAME = 'In Context';

function escAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function blockToHtml(b) {
  if (b.type === 'h2')   return `<h2>${b.html}</h2>`;
  if (b.type === 'pull') return `<blockquote class="pull">\u201C${b.html}\u201D</blockquote>`;
  if (b.type === 'code') return `<pre class="code"><code>${b.html}</code></pre>`;
  if (b.type === 'list') {
    const T = b.ordered ? 'ol' : 'ul';
    return `<${T}>${b.items.map(i => `<li>${i}</li>`).join('')}</${T}>`;
  }
  return `<p>${b.html}</p>`;
}

function postPage(post) {
  const url = `${SITE_URL}/p/${post.id}`;
  const title = post.title;
  const description = post.excerpt || `${title} — by ${AUTHOR}.`;
  const iso = post._sortDate || '';
  const bodyHtml = post.body.map(blockToHtml).join('\n');
  const bannerUrl = post.banner ? (post.banner.startsWith('http') ? post.banner : SITE_URL + post.banner) : '';
  const bannerAlt = post.bannerAlt || title;
  // Prefer ogImage (raster) for social meta tags; fall back to banner.
  const ogRaw = post.ogImage || post.banner || '';
  const ogUrl = ogRaw ? (ogRaw.startsWith('http') ? ogRaw : SITE_URL + ogRaw) : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: iso,
    dateModified: iso,
    url,
    mainEntityOfPage: url,
    articleSection: post.category,
    inLanguage: 'en',
    author:    { '@type': 'Person', name: AUTHOR, url: SITE_URL + '/' },
    publisher: { '@type': 'Person', name: AUTHOR, url: SITE_URL + '/' },
    ...(ogUrl ? { image: ogUrl } : {})
  };

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escAttr(title)} — ${SITE_NAME}</title>
<meta name="description" content="${escAttr(description)}" />
<meta name="author" content="${AUTHOR}" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<link rel="canonical" href="${url}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escAttr(title)}" />
<meta property="og:description" content="${escAttr(description)}" />
<meta property="og:url" content="${url}" />
<meta property="og:locale" content="en_US" />
<meta property="article:author" content="${AUTHOR}" />
<meta property="article:published_time" content="${iso}" />
<meta property="article:section" content="${escAttr(post.category)}" />
${ogUrl ? `<meta property="og:image" content="${ogUrl}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escAttr(bannerAlt)}" />` : ''}

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escAttr(title)}" />
<meta name="twitter:description" content="${escAttr(description)}" />
<meta name="twitter:creator" content="@aravs16" />${ogUrl ? `
<meta name="twitter:image" content="${ogUrl}" />` : ''}

<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

<link rel="alternate" type="application/rss+xml" title="${SITE_NAME}" href="/feed.xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter+Tight:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles.css" />
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
</head>
<body>
<div id="root">
<article class="detail">
<a class="back" href="/">← All writing</a>
<span class="post-tag">${escAttr(post.category)}</span>
<h1 class="post-h">${escAttr(title)}</h1>
<div class="post-meta-row mono">
<span>${escAttr(post.date)}</span><span class="sep">·</span><span>${escAttr(post.readTime)} read</span><span class="sep">·</span><span>By ${AUTHOR}</span>
</div>
${post.banner ? `<figure class="post-banner"><img src="${escAttr(post.banner)}" alt="${escAttr(bannerAlt)}" loading="eager" /></figure>` : ''}
<div class="prose">
${bodyHtml}
</div>
</article>
</div>

<script src="/posts.js"></script>
<script type="text/babel" src="/tweaks-panel.jsx"></script>
<script type="text/babel" src="/app.jsx"></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

function buildSitemap(posts) {
  const urls = [
    { loc: `${SITE_URL}/`,                changefreq: 'weekly',  priority: '1.0' },
    { loc: `${SITE_URL}/learning/genai`,  changefreq: 'monthly', priority: '0.9' }
  ];
  for (const p of posts) {
    urls.push({
      loc: `${SITE_URL}/p/${p.id}`,
      lastmod: p._sortDate || undefined,
      changefreq: 'monthly',
      priority: '0.8'
    });
  }
  const entries = urls.map(u => {
    const lm = u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '';
    return `  <url>
    <loc>${u.loc}</loc>${lm}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

// For each post with an SVG banner and a PNG ogImage, regenerate the PNG from
// the SVG using `sharp` (if installed). Silent if sharp isn't available — the
// PNG will simply not be refreshed, which is fine for incremental builds.
function rasterizeBanners(posts) {
  let sharp;
  try { sharp = require('sharp'); } catch { return; }
  for (const p of posts) {
    if (!p.banner || !p.ogImage) continue;
    if (!p.banner.endsWith('.svg') || !p.ogImage.endsWith('.png')) continue;
    const svgPath = path.join(__dirname, 'public', p.banner.replace(/^\//, ''));
    const pngPath = path.join(__dirname, 'public', p.ogImage.replace(/^\//, ''));
    if (!fs.existsSync(svgPath)) continue;
    try {
      const svgBuf = fs.readFileSync(svgPath);
      sharp(svgBuf, { density: 144 })
        .resize(1200, 630, { fit: 'contain', background: '#f1ede2' })
        .png()
        .toFile(pngPath)
        .then(() => console.log(`Rasterized ${path.basename(svgPath)} → ${path.basename(pngPath)}`))
        .catch((e) => console.warn(`SVG → PNG failed for ${p.id}: ${e.message}`));
    } catch (e) {
      console.warn(`SVG → PNG skipped for ${p.id}: ${e.message}`);
    }
  }
}

function build() {
  if (!fs.existsSync(ROOT)) {
    console.error(`content directory missing: ${ROOT}`);
    process.exit(1);
  }
  const files = walk(ROOT);
  const allPosts = files
    .map(buildPost)
    .sort((a, b) => (b._sortDate || '').localeCompare(a._sortDate || ''));
  const posts = allPosts.map(({ _sortDate, ...p }) => p);

  rasterizeBanners(allPosts);

  const js =
    '// AUTOGENERATED by build.js — do not edit by hand.\n' +
    '// Edit content/posts/**/*.md and re-run `node build.js`.\n' +
    'window.POSTS = ' + JSON.stringify(posts, null, 2) + ';\n';
  fs.writeFileSync(OUT, js);
  console.log(`Built ${posts.length} post(s) → ${path.relative(process.cwd(), OUT)}`);

  // Per-post prerendered HTML for SEO + social previews
  const postsDir = path.join(__dirname, 'public', 'p');
  fs.mkdirSync(postsDir, { recursive: true });
  for (const f of fs.readdirSync(postsDir)) {
    if (f.endsWith('.html')) fs.unlinkSync(path.join(postsDir, f));
  }
  for (const post of allPosts) {
    fs.writeFileSync(path.join(postsDir, `${post.id}.html`), postPage(post));
  }
  console.log(`Wrote ${allPosts.length} prerendered post page(s) → public/p/*.html`);

  // sitemap.xml
  fs.writeFileSync(
    path.join(__dirname, 'public', 'sitemap.xml'),
    buildSitemap(allPosts)
  );
  console.log('Wrote public/sitemap.xml');
}

build();
