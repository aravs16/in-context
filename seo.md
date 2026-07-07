# SEO Plan — incontext.sh / GenAI Learning Path

_Audit date: 2026-07-07. Status: PLANNED — not yet implemented._

## Diagnosis: why the site isn't indexed yet

Findings from probing the live site (in order of impact):

1. **All 12 phase URLs in sitemap.xml return 404 in production.**
   `vercel.json` rewrite `/learning/genai/phase-:n` does not match on Vercel's
   router (`:param` after a mid-segment hyphen isn't supported). Works locally
   only because `serve.js` uses a `startsWith` check. Google fetched a sitemap
   where ~14 of 23 URLs are dead → crawl trust tanked.
2. **`/feed.xml` is 404** but is advertised in every page `<head>`
   (`<link rel="alternate" type="application/rss+xml">`) and the sidebar.
3. **Likely wrong GSC property.** `https://incontext.sh` 307-redirects to
   `https://www.incontext.sh`. If the property was added as the apex
   URL-prefix, GSC will report "Page with redirect / not indexed" forever.
   Use the **Domain property** (DNS-verified) and request indexing on the
   exact canonical `https://www.incontext.sh/`.
4. **No internal links to phases.** Phase cards are `<div onClick>` — zero
   `<a href>` elements point at phase URLs. Sitemap is the only discovery
   path, and it's broken (see #1).
5. **New domain, zero backlinks.** Even clean sites take 1–4 weeks. Nothing
   from incontext.sh is in Google yet (verified via search).

## Keyword strategy

- Head terms ("generative AI roadmap", "AI learning path 2026") are owned by
  high-DA edtech mills (Coursera, upGrad, Scaler, WsCube). Not winnable soon.
- The wedge: **long-tail per-phase intent queries** — each phase page becomes
  a focused landing page:
  - "build a RAG pipeline beginner tutorial" (phase 2)
  - "promptfoo eval tutorial / how to eval LLM prompts" (phase 3)
  - "LLM tool use / agent loop tutorial" (phase 4)
  - "text-to-SQL with LLMs" (phase 5)
  - "LLM observability Langfuse tutorial" (phase 6)
  - "LLM guardrails tutorial" (phase 7)
  - "agent memory short-term long-term" (phase 8)
  - "MCP server tutorial for beginners" (phase 9)
  - "agent evaluation trajectory hallucination rate" (phase 10)
  - "multi-agent patterns LangGraph / Strands" (phase 11)
  - "agent harness design" (phase 12)
- Differentiators to push in titles/copy: *build-as-you-learn, one growing
  codebase, no coding required (drive a coding assistant), free, no signup.*
- The hub page never literally says "generative AI" in visible copy (only
  "GenAI") — include the full phrase in H1-adjacent copy.

## P0 — Unblock indexing (do first)

- [ ] **Fix Vercel rewrite**: replace the two `phase-:n` rewrites with a
      catch-all: `{ "source": "/learning/genai/:path*", "destination": "/learning/genai.html" }`
      (prerendered phase files, once added, win over the rewrite via
      filesystem precedence).
- [ ] **Human-readable slugs** (canonical), `phase-N` kept as 308 redirects:

  | Old | New slug |
  |---|---|
  | /phase-1  | /phase-1-talk-to-an-llm |
  | /phase-2  | /phase-2-rag-give-the-llm-your-data |
  | /phase-3  | /phase-3-evals-stop-guessing |
  | /phase-4  | /phase-4-agents-and-tool-use |
  | /phase-5  | /phase-5-text-to-sql |
  | /phase-6  | /phase-6-llm-observability |
  | /phase-7  | /phase-7-guardrails |
  | /phase-8  | /phase-8-agent-memory |
  | /phase-9  | /phase-9-mcp |
  | /phase-10 | /phase-10-agent-evals |
  | /phase-11 | /phase-11-multi-agent |
  | /phase-12 | /phase-12-agent-harness |

  Router (`parsePhasePath` in `learning/genai/app.jsx`) accepts both forms;
  `phasePath()` emits the slugged form; slugs live in `phases-data.js`.
- [ ] **Prerender each phase at build time** (extend `build.js`, same pattern
      as blog posts → `public/learning/genai/phase-*.html`):
      unique `<title>` ("Phase 5 — Talk to Your Database: Text-to-SQL with
      LLMs | GenAI Learning Path"), unique meta description, canonical,
      per-phase `LearningResource`/`Article` + `BreadcrumbList` JSON-LD, and
      the phase's goal/plan/lesson text as real HTML before React hydrates.
      **Single biggest ranking win.**
- [ ] **Real `<a href>` phase links**: wrap grid/timeline cards in anchors
      (keep JS click behavior); add prev/next links between phases.
- [ ] **Generate `feed.xml`** (RSS for posts) in `build.js`.
- [ ] **Regenerate sitemap** with slugged URLs + `lastmod`.
- [ ] **GSC (manual, after deploy)**: add Domain property `incontext.sh`
      (DNS TXT verify) → resubmit sitemap → URL-inspect + Request Indexing
      for `/`, `/learning/genai`, then phases (~10/day quota).

## P1 — On-page polish

- [ ] **og:image / twitter:image** for the LP hub and each phase — currently
      `summary_large_image` is declared with no image. Reuse the sharp
      SVG→PNG pipeline in `build.js` to stamp branded 1200×630 cards.
- [ ] Add "generative AI" (full phrase) to visible hub copy near the H1.
- [ ] Visible breadcrumbs on phase pages (In Context → Learning Path →
      Phase N) matching the BreadcrumbList JSON-LD.
- [ ] Blog ↔ LP internal linking: related posts link to specific phases and
      vice versa.

## P2 — Performance (Core Web Vitals)

- [ ] Swap React dev UMD builds → production builds (all pages).
- [ ] Precompile JSX with esbuild at build time instead of shipping
      Babel-standalone to the browser (biggest LCP/TBT win; applies to blog
      pages and LP).
- [ ] Font loading: `font-display: swap` is already via Google Fonts CSS;
      consider preloading the two heaviest woff2 files.

## P3 — Off-page / distribution

- [ ] Link incontext.sh from LinkedIn profile, GitHub profile, X bio.
- [ ] Show HN post for the learning path; r/learnmachinelearning, dev.to.
- [ ] Each new phase walkthrough ships with a companion blog post linking to
      it (content flywheel).
- [ ] Expect 1–4 weeks post-fix for indexing; backlinks accelerate it.

## Notes

- Apex→www redirect is 307 (Vercel default). Not a blocker; Google follows
  it. Domain property in GSC makes it moot.
- Blog post pages (`/p/*`) are already prerendered with good meta + JSON-LD —
  the LP just needs to reach parity.
