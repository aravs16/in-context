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
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" crossorigin="anonymous"></script>
</head>
<body>
<script>document.documentElement.setAttribute("data-theme","ink")</script>
<div id="root">
<article class="detail">
<a class="back" href="/">← All writing</a>
<span class="post-tag">${escAttr(post.category)}</span>
<h1 class="post-h">${escAttr(title)}</h1>
<div class="post-meta-row mono">
<span>${escAttr(post.date)}</span><span class="sep">·</span><span>${escAttr(post.readTime)} read</span><span class="sep">·</span><span>By ${AUTHOR}</span>
</div>
<p class="disclaimer">Views here are my own. They do not represent my employer, and nothing I write is affiliated with or endorsed by them.</p>
${post.banner ? `<figure class="post-banner"><img src="${escAttr(post.banner)}" alt="${escAttr(bannerAlt)}" loading="eager" /></figure>` : ''}
<div class="prose">
${bodyHtml}
</div>
</article>
</div>

<script src="/posts.js"></script>
<script type="text/babel" src="/tweaks-panel.jsx"></script>
<script type="text/babel" src="/like-button.jsx"></script>
<script type="text/babel" src="/app.jsx"></script>
<script defer src="/_vercel/insights/script.js"></script>
</body>
</html>
`;
}

/* ---------- GenAI learning path: load data + prerender phase pages ---------- */

const LP_DIR = path.join(__dirname, 'public', 'learning', 'genai');
const LP_URL = `${SITE_URL}/learning/genai`;

function loadLearningPath() {
  const vm = require('vm');
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(LP_DIR, 'phases-data.js'), 'utf8'), sandbox);
  const lessonsDir = path.join(LP_DIR, 'lessons');
  if (fs.existsSync(lessonsDir)) {
    for (const f of fs.readdirSync(lessonsDir)) {
      if (f.endsWith('.js')) {
        vm.runInNewContext(fs.readFileSync(path.join(lessonsDir, f), 'utf8'), sandbox);
      }
    }
  }
  return { phases: sandbox.window.PHASES || [], lessons: sandbox.window.PHASE_LESSONS || {} };
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function phaseDescription(p) {
  let d = stripTags(p.goal);
  const more = stripTags((p.what && p.what[0]) || '');
  if (more) d += ' ' + more;
  if (d.length > 158) d = d.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  return d;
}

function phaseLastmod(p) {
  const times = [fs.statSync(path.join(LP_DIR, 'phases-data.js')).mtime];
  const lessonFile = path.join(LP_DIR, 'lessons', `phase-${p.n}.js`);
  if (fs.existsSync(lessonFile)) times.push(fs.statSync(lessonFile).mtime);
  return new Date(Math.max(...times.map(t => t.getTime()))).toISOString().slice(0, 10);
}

// Text-bearing lesson blocks become static HTML; interactive widgets are skipped.
function lessonBlockHtml(b) {
  if (b.t === 'p') return `<p>${b.html}</p>`;
  if (b.t === 'h') return `<h3>${escapeHtml(b.text || '')}</h3>`;
  if (b.t === 'list') return `<ul>${(b.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
  if (b.t === 'callout') return `<blockquote>${b.title ? `<strong>${escapeHtml(b.title)}.</strong> ` : ''}${b.html || ''}</blockquote>`;
  if (b.t === 'code') return `<pre><code>${escapeHtml(b.code || '')}</code></pre>`;
  return '';
}

function phaseStaticHtml(p, lessons, prev, next) {
  const num = String(p.n).padStart(2, '0');
  const lessonHtml = (lessons || []).map(l => {
    const blocks = (l.blocks || []).map(lessonBlockHtml).filter(Boolean).join('\n');
    if (!blocks) return '';
    return `<section><h2>${escapeHtml(l.label)}</h2>\n${blocks}</section>`;
  }).filter(Boolean).join('\n');
  return `
<div class="page ssr-phase">
<nav class="ssr-crumbs"><a href="/">In Context</a> › <a href="/learning/genai">GenAI Learning Path</a> › <span>Phase ${num}</span></nav>
<p class="ssr-kicker">PHASE ${num} · ${escapeHtml(p.kicker)}</p>
<h1>${escapeHtml(p.title)}</h1>
<p class="ssr-goal"><strong>Goal:</strong> ${stripTags(p.goal)}</p>
<p class="lp-disclaimer">Views here are my own. They do not represent my employer, and nothing I write is affiliated with or endorsed by them.</p>
<section><h2>What this is</h2>
${(p.what || []).map(w => `<p>${w}</p>`).join('\n')}</section>
<section><h2>The plan</h2><ol>
${(p.plan || []).map(s => `<li>${s}</li>`).join('\n')}</ol></section>
<section><h2>Ask your coding assistant</h2><ul>
${(p.research || []).map(q => `<li>${q}</li>`).join('\n')}</ul></section>
<section><h2>What you'll have when you're done</h2><ul>
${(p.outcomes || []).map(o => `<li>${o}</li>`).join('\n')}</ul></section>
<section><h2>Deliverable</h2>
<p><code>${escapeHtml(p.deliverable.file)}</code> — ${escapeHtml(p.deliverable.desc)}</p>
<p>Concepts unlocked: ${(p.concepts || []).map(escapeHtml).join(' · ')}</p></section>
${lessonHtml}
<nav class="ssr-pager">
${prev ? `<a rel="prev" href="/learning/genai/${prev.slug}">← Phase ${prev.n}: ${escapeHtml(prev.title)}</a>` : ''}
<a href="/learning/genai">All 12 phases</a>
${next ? `<a rel="next" href="/learning/genai/${next.slug}">Phase ${next.n}: ${escapeHtml(next.title)} →</a>` : ''}
</nav>
</div>`;
}

function phaseJsonLd(p, canon) {
  return JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: `Phase ${p.n} — ${p.title}`,
      description: phaseDescription(p),
      url: canon,
      inLanguage: 'en',
      educationalLevel: 'Beginner',
      learningResourceType: 'Tutorial',
      isAccessibleForFree: true,
      teaches: p.concepts || [],
      isPartOf: { '@type': 'Course', name: 'The GenAI Learning Path', url: LP_URL },
      author: { '@type': 'Person', name: AUTHOR, url: SITE_URL + '/' }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'In Context', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: 'GenAI Learning Path', item: LP_URL },
        { '@type': 'ListItem', position: 3, name: `Phase ${p.n} — ${p.title}`, item: canon }
      ]
    }
  ]);
}

// Each phase page is the hub page (genai.html) with head + root swapped, so
// styling, scripts, and hydration behavior stay identical by construction.
function buildPhasePages() {
  const { phases, lessons } = loadLearningPath();
  const template = fs.readFileSync(path.join(LP_DIR, '..', 'genai.html'), 'utf8');
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i];
    const canon = `${LP_URL}/${p.slug}`;
    const title = `Phase ${p.n} — ${p.title} | GenAI Learning Path`;
    const desc = phaseDescription(p);
    const ogImg = `${LP_URL}/og/${p.slug}.png`;
    let html = template;
    html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)} | In Context</title>`);
    html = html.replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escAttr(desc)}" />`);
    html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canon}" />`);
    html = html.replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escAttr(title)}" />`);
    html = html.replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${escAttr(desc)}" />`);
    html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canon}" />`);
    html = html.replace(/<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${ogImg}" />`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${ogImg}" />`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${escAttr(title)}" />`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${escAttr(desc)}" />`);
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${phaseJsonLd(p, canon)}</script>`);
    html = html.replace('<div id="root"></div>', `<div id="root">${phaseStaticHtml(p, lessons[p.n], phases[i - 1], phases[i + 1])}</div>`);
    fs.writeFileSync(path.join(LP_DIR, `${p.slug}.html`), html);
  }
  console.log(`Wrote ${phases.length} prerendered phase page(s) → public/learning/genai/phase-*.html`);
  return phases;
}

function buildFeed(posts) {
  const items = posts.map(p => {
    const url = `${SITE_URL}/p/${p.id}`;
    const pub = p._sortDate ? new Date(p._sortDate + 'T12:00:00Z').toUTCString() : '';
    return `  <item>
    <title>${escAttr(p.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>${pub ? `
    <pubDate>${pub}</pubDate>` : ''}
    <description>${escAttr(p.excerpt || '')}</description>
  </item>`;
  }).join('\n');
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${SITE_NAME}</title>
  <link>${SITE_URL}/</link>
  <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
  <description>Essays on agentic AI, safety, and the practice of building with LLMs — by ${AUTHOR}.</description>
  <language>en-us</language>
${items}
</channel>
</rss>
`;
  fs.writeFileSync(path.join(__dirname, 'public', 'feed.xml'), feed);
  console.log('Wrote public/feed.xml');
}

function buildSitemap(posts, phases) {
  const urls = [
    { loc: `${SITE_URL}/`,                changefreq: 'weekly',  priority: '1.0' },
    { loc: `${SITE_URL}/learning/genai`,  changefreq: 'monthly', priority: '0.9',
      lastmod: phaseLastmod({ n: 0 }) }
  ];
  for (const p of phases) {
    urls.push({ loc: `${LP_URL}/${p.slug}`, changefreq: 'monthly', priority: '0.7', lastmod: phaseLastmod(p) });
  }
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

  // Prerendered learning-path phase pages (clean out stale ones first)
  for (const f of fs.readdirSync(LP_DIR)) {
    if (/^phase-\d.*\.html$/.test(f)) fs.unlinkSync(path.join(LP_DIR, f));
  }
  const phases = buildPhasePages();

  // RSS feed
  buildFeed(allPosts);

  // sitemap.xml
  fs.writeFileSync(
    path.join(__dirname, 'public', 'sitemap.xml'),
    buildSitemap(allPosts, phases)
  );
  console.log('Wrote public/sitemap.xml');
}

build();
