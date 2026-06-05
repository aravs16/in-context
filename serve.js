#!/usr/bin/env node
// Tiny zero-dep static server. Runs `node build.js` once at startup, then
// rebuilds on every request for /posts.js so editing a .md and refreshing
// the browser Just Works.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PORT = Number(process.env.PORT) || 5173;
const PUBLIC = path.join(__dirname, 'public');

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.jsx':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.ico':  'image/x-icon',
};

function build() {
  const r = spawnSync('node', ['build.js'], { cwd: __dirname });
  if (r.status !== 0) {
    process.stderr.write(r.stderr.toString());
  } else {
    process.stdout.write(r.stdout.toString());
  }
}

build();

function tryServe(candidates, res) {
  if (candidates.length === 0) {
    res.writeHead(404); res.end('Not found');
    return;
  }
  const [first, ...rest] = candidates;
  fs.readFile(first, (err, data) => {
    if (err) return tryServe(rest, res);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(first)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let url = decodeURIComponent((req.url || '/').split('?')[0]);
  if (url === '/') url = '/index.html';
  else if (url.endsWith('/')) url += 'index.html';
  if (url === '/posts.js') build();

  const file = path.join(PUBLIC, url);
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); res.end(); return; }

  // Resolution order mirrors Vercel cleanUrls + SPA fallback:
  //   1. exact file (e.g. /styles.css, /p/foo.html, /sitemap.xml)
  //   2. extensionless → try <path>.html (e.g. /p/foo → /p/foo.html)
  //   3. extensionless → fall back to /index.html (SPA shell)
  const candidates = [file];
  if (!path.extname(file)) {
    candidates.push(file + '.html');
    candidates.push(path.join(PUBLIC, 'index.html'));
  }
  tryServe(candidates, res);
});

server.listen(PORT, () => console.log(`in context → http://localhost:${PORT}`));
