/* GenAI Learning Path — interactive timeline with grid + vertical views */
const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

const COLS = 3;
const WIDE_AT = 940;
const VIEW_KEY = "genai-path-view";
const THEME_KEY = "genai-path-theme";

if (window.mermaid) {
  window.mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      primaryColor: "#fbf9f2",
      primaryTextColor: "#1c1813",
      primaryBorderColor: "#c2552b",
      lineColor: "#a8431f",
      secondaryColor: "#eae4d6",
      tertiaryColor: "#f4e3d6",
      tertiaryBorderColor: "#cfc6b1",
      clusterBkg: "#f4e3d6",
      clusterBorder: "#cfc6b1",
      fontFamily: 'Space Grotesk, ui-sans-serif, system-ui, sans-serif',
      fontSize: "13px"
    },
    flowchart: { curve: "basis", padding: 16, htmlLabels: true },
    sequence: { actorMargin: 50, boxMargin: 10, mirrorActors: false },
    securityLevel: "loose"
  });
}

function placement(i) {
  const row = Math.floor(i / COLS);
  const inRow = i % COLS;
  const col = row % 2 === 0 ? inRow + 1 : COLS - inRow;
  return { col, row: row + 1 };
}

/* ---- Phase deep links: /learning/genai/phase-<n>[/<subtopic-id>] ----
   Vercel rewrites (and serve.js locally) serve genai.html for these paths;
   the app reads the URL on load and keeps it in sync via pushState, which
   also makes each phase a distinct pageview in Vercel Analytics. */
const BASE_PATH = "/learning/genai";
const BASE_TITLE = document.title;

function phasePath(n, subId) {
  const p = window.PHASES.find((ph) => ph.n === n);
  const seg = p && p.slug ? p.slug : "phase-" + n;
  return BASE_PATH + "/" + seg + (subId ? "/" + subId : "");
}

// Accepts both the canonical slugged form (/phase-5-text-to-sql) and the
// legacy numeric form (/phase-5) — Vercel 308s legacy → slugged in prod.
function parsePhasePath() {
  const m = window.location.pathname.match(/\/learning\/genai\/phase-(\d+)(?:-[a-z0-9-]+)?(?:\/([A-Za-z0-9-]+))?\/?$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const idx = window.PHASES.findIndex((p) => p.n === n);
  return idx === -1 ? null : { idx, sub: m[2] || null };
}

const INITIAL_ROUTE = parsePhasePath();

/* ============================ App ============================ */
function App() {
  const [view, setViewState] = useState(() => {
    try { return localStorage.getItem(VIEW_KEY) || "grid"; }
    catch { return "grid"; }
  });
  const setView = (v) => {
    setViewState(v);
    try { localStorage.setItem(VIEW_KEY, v); } catch {}
  };

  const [route, setRoute] = useState(INITIAL_ROUTE);
  const [howTo, setHowTo] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) || "ink"; }
    catch { return "ink"; }
  });
  const setTheme = (v) => {
    setThemeState(v);
    try { localStorage.setItem(THEME_KEY, v); } catch {}
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  const modal = route ? route.idx : null;

  const openModal = (i) => {
    setRoute({ idx: i, sub: null });
    const url = phasePath(window.PHASES[i].n);
    if (window.location.pathname !== url) history.pushState({}, "", url);
  };
  const closeModal = () => {
    setRoute(null);
    if (window.location.pathname !== BASE_PATH) history.pushState({}, "", BASE_PATH);
  };

  useEffect(() => {
    const onPop = () => setRoute(parsePhasePath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (route) {
      const p = window.PHASES[route.idx];
      document.title = "Phase " + p.n + " · " + p.title + " — " + BASE_TITLE;
    } else {
      document.title = BASE_TITLE;
    }
  }, [route]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { closeModal(); setHowTo(false); setAskOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const anyOpen = modal !== null || howTo || askOpen;
    if (anyOpen) document.body.classList.add("modal-open");
    else document.body.classList.remove("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [modal, howTo, askOpen]);

  return (
    <div className="page">
      <a className="topback" href="/">
        <svg viewBox="0 0 16 16" fill="none"><path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Back to In Context
      </a>
      <LikeButton id="genai-learning-path" namespace="in-context" />
      <Header view={view} setView={setView}
              theme={theme} setTheme={setTheme}
              onHowTo={() => setHowTo(true)}
              onAsk={() => setAskOpen(true)}
              onSubscribe={() => {
                const el = document.getElementById("subscribe");
                if (!el) return;
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                const input = el.querySelector("input");
                if (input) setTimeout(() => input.focus({ preventScroll: true }), 550);
              }} />
      {view === "grid"
        ? <SerpentineBoard onOpen={openModal} />
        : <VerticalTimeline onOpen={openModal} />}
      <SubscribeBand />
      <NextSteps />
      {modal !== null && (() => {
        const phase = window.PHASES[modal];
        const lessons = window.PHASE_LESSONS && window.PHASE_LESSONS[phase.n];
        return lessons && lessons.length
          ? <LessonModal key={phase.n} phase={phase} lessons={lessons} initialSub={route.sub}
              onNav={(subId) => history.replaceState({}, "", phasePath(phase.n, subId))}
              onClose={closeModal} />
          : <Pane phase={phase} onClose={closeModal} />;
      })()}
      {howTo && <HowToModal onClose={() => setHowTo(false)} />}
      {askOpen && <QuestionModal onClose={() => setAskOpen(false)} />}
    </div>
  );
}

/* ============================ Header ============================ */
function ThemeGlyph({ theme }) {
  if (theme === "ink") {
    return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="currentColor" /><circle cx="8" cy="5" r="3" fill="var(--paper-2)" /></svg>;
  }
  if (theme === "sage") {
    return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 7 Q6 4 8.5 7" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
  }
  return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

function ThemeToggle({ theme, setTheme }) {
  const order = ["paper", "sage", "ink"];
  const labels = { paper: "Paper", sage: "Sage", ink: "Ink" };
  const next = () => setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  return (
    <button className="howto-btn" onClick={next} title="Cycle theme" aria-label={"Theme: " + labels[theme]}>
      <ThemeGlyph theme={theme} />
      {labels[theme]}
    </button>
  );
}

function heroArtSrc(theme) {
  return "/learning/genai/img/hero-tree" + (theme === "paper" ? "" : "-" + theme) + ".png";
}

function Header({ view, setView, theme, setTheme, onHowTo, onAsk, onSubscribe }) {
  return (
    <header className="hdr">
      <div className="eyebrow-row">
        <div className="eyebrow">
          <span className="eyebrow-dot" aria-hidden="true" />
          GENERATIVE AI · BUILD-AS-YOU-LEARN
        </div>
        <div className="eyebrow-rule" />
        <div className="hdr-actions">
          <button className="howto-btn" onClick={onHowTo} aria-label="How to use this guide">
            <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5.4 5.2 C5.4 4.2 6.1 3.5 7 3.5 C7.9 3.5 8.6 4.1 8.6 5 C8.6 6.3 7 6.3 7 7.5"
                    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <circle cx="7" cy="10" r="0.7" fill="currentColor" />
            </svg>
            How to use
          </button>
          <button className="howto-btn" onClick={onAsk} aria-label="Ask a question">
            <i className="ph-duotone ph-chat-circle-dots" aria-hidden="true" />
            Ask a question
          </button>
          <button className="howto-btn" onClick={onSubscribe} aria-label="Subscribe for updates">
            <i className="ph-duotone ph-envelope-simple" aria-hidden="true" />
            Subscribe
          </button>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <div className="hdr-grid">
        <div className="hdr-main">
          <h1 className="title-block">
            <span className="title-line">The GenAI</span>
            <span className="title-line alt">Learning Path</span>
          </h1>

          <div className="title-badges">
            <span className="title-badge">
              <i className="ph-duotone ph-seedling" aria-hidden="true" />
              FOR BEGINNERS
            </span>
            <span className="title-badge">
              <i className="ph-duotone ph-clock" aria-hidden="true" />
              4–5 WEEKS
            </span>
          </div>

          <p className="lede">
            A practical generative AI roadmap where every phase ships a working artifact and the next one extends
            it — one running codebase growing from a single API call into a multi-agent system with
            memory, tools, guardrails, and evals. <strong>You don't need to know how to code</strong> —
            if you can describe what you want, a coding assistant writes it. Your job is to run it,
            watch it work, and understand it.
          </p>

          <div className="hero-cta-row">
            <a className="setup-cta" href="https://code.claude.com/docs/en/quickstart"
               target="_blank" rel="noopener noreferrer">
              <i className="ph-duotone ph-rocket-launch" aria-hidden="true" />
              Set up your coding assistant
              <span className="setup-cta-arrow">↗</span>
            </a>
            <span className="setup-cta-note">~2 min · Claude Code (or any assistant you like)</span>
          </div>
        </div>

        <div className="hdr-art" aria-hidden="true">
          <img src={heroArtSrc(theme)} alt="" />
        </div>
      </div>

      <div className="hdr-rule" />

      <div className="stats-row">
        <span><span className="stat-num">12</span> phases</span>
        <span><span className="stat-num">1</span> running codebase</span>
        <span><span className="stat-arrow">↗</span> ships an artifact each step</span>
        <span className="hint">Hover for the gist · click for the full brief</span>
        <ViewToggle view={view} setView={setView} />
      </div>

      <p className="lp-disclaimer">Views here are my own. They do not represent my employer, and nothing I write is affiliated with or endorsed by them.</p>
    </header>
  );
}

function ViewToggle({ view, setView }) {
  return (
    <div className="view-toggle" role="tablist" aria-label="View mode">
      <button
        type="button"
        role="tab"
        aria-selected={view === "grid"}
        className={view === "grid" ? "active" : ""}
        onClick={() => setView("grid")}
      >
        <svg viewBox="0 0 12 12" fill="none">
          <rect x="1" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
          <rect x="7" y="1" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
          <rect x="1" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
          <rect x="7" y="7" width="4" height="4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Grid
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "list"}
        className={view === "list" ? "active" : ""}
        onClick={() => setView("list")}
      >
        <svg viewBox="0 0 12 12" fill="none">
          <circle cx="3" cy="3" r="1.4" fill="currentColor" />
          <circle cx="3" cy="9" r="1.4" fill="currentColor" />
          <path d="M3 4.5 L3 7.5" stroke="currentColor" strokeWidth="1" />
          <line x1="6" y1="3" x2="11" y2="3" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6" y1="9" x2="11" y2="9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Timeline
      </button>
    </div>
  );
}

/* ============================ Serpentine grid (original) ============================ */
function SerpentineBoard({ onOpen }) {
  const [wide, setWide] = useState(true);
  const [peek, setPeek] = useState(null);
  const boardRef = useRef(null);
  const cardRefs = useRef([]);
  const [segs, setSegs] = useState([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const drawnRef = useRef(false);
  const [drawn, setDrawn] = useState(false);

  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWide(el.clientWidth >= WIDE_AT));
    ro.observe(el);
    setWide(el.clientWidth >= WIDE_AT);
    return () => ro.disconnect();
  }, []);

  const recompute = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const b = board.getBoundingClientRect();
    const out = [];
    const cards = cardRefs.current;
    const R = Math.round;
    for (let i = 0; i < cards.length - 1; i++) {
      const a = cards[i], c = cards[i + 1];
      if (!a || !c) continue;
      const ra = a.getBoundingClientRect();
      const rc = c.getBoundingClientRect();
      const A = { l: ra.left - b.left, r: ra.right - b.left, t: ra.top - b.top, btm: ra.bottom - b.top, cx: (ra.left + ra.right) / 2 - b.left, cy: (ra.top + ra.bottom) / 2 - b.top };
      const C = { l: rc.left - b.left, r: rc.right - b.left, t: rc.top - b.top, btm: rc.bottom - b.top, cx: (rc.left + rc.right) / 2 - b.left, cy: (rc.top + rc.bottom) / 2 - b.top };
      const sameRow = Math.abs(A.cy - C.cy) < 24;
      // Snap to a shared Y (horizontal) or shared X (vertical) so lines are perfectly straight
      // even if cards differ by a hairline pixel.
      let d;
      if (sameRow) {
        const y = R((A.cy + C.cy) / 2);
        d = A.cx < C.cx
          ? `M ${R(A.r)} ${y} L ${R(C.l)} ${y}`
          : `M ${R(A.l)} ${y} L ${R(C.r)} ${y}`;
      } else {
        const x = R((A.cx + C.cx) / 2);
        d = `M ${x} ${R(A.btm)} L ${x} ${R(C.t)}`;
      }
      out.push({ d, i });
    }
    setSegs(out);
    setDims({ w: board.clientWidth, h: board.clientHeight });
    if (!drawnRef.current) {
      drawnRef.current = true;
      requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    }
  }, []);

  useLayoutEffect(() => {
    recompute();
    const onR = () => recompute();
    window.addEventListener("resize", onR);
    const ro = new ResizeObserver(onR);
    if (boardRef.current) ro.observe(boardRef.current);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => recompute());
    const t = setTimeout(recompute, 300);
    return () => { window.removeEventListener("resize", onR); ro.disconnect(); clearTimeout(t); };
  }, [recompute, wide]);

  return (
    <div className="board-wrap">
      <div className="board" ref={boardRef}>
        <svg className="wires" width={dims.w} height={dims.h} viewBox={`0 0 ${dims.w} ${dims.h}`} aria-hidden="true">
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
              <path d="M1 1 L5 3 L1 5" fill="none" stroke="var(--accent)" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {segs.map((s) => (
            <path
              key={s.i}
              d={s.d}
              className={"wire" + (drawn ? " drawn" : "")}
              markerEnd="url(#arrow)"
              style={{ animationDelay: `${0.2 + s.i * 0.08}s` }}
            />
          ))}
        </svg>
        {window.PHASES.map((p, i) => {
          const pl = wide ? placement(i) : null;
          return (
            <PhaseCard
              key={p.n}
              phase={p}
              index={i}
              style={pl ? { gridColumn: pl.col, gridRow: pl.row } : {}}
              refCb={(el) => (cardRefs.current[i] = el)}
              onOpen={() => onOpen(i)}
              onPeek={() => setPeek(i)}
              onUnpeek={() => setPeek((cur) => (cur === i ? null : cur))}
              peeking={peek === i}
            />
          );
        })}
      </div>
    </div>
  );
}

function PhaseCard({ phase, index, style, refCb, onOpen, onPeek, onUnpeek, peeking }) {
  const num = String(phase.n).padStart(2, "0");
  return (
    <a
      className={"card" + (peeking ? " peeking" : "")}
      data-phase={phase.n}
      href={phasePath(phase.n)}
      style={style}
      ref={refCb}
      onMouseEnter={onPeek}
      onMouseLeave={onUnpeek}
      onFocus={onPeek}
      onBlur={onUnpeek}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
        e.preventDefault();
        onOpen();
      }}
    >
      <div className="card-top">
        {phase.icon && <i className={"ph-duotone ph-" + phase.icon + " phase-icon"} aria-hidden="true" />}
        <span className="kicker">{phase.kicker}</span>
        <span className="num">{num}</span>
      </div>
      <h3 className="card-title">{phase.title}</h3>
      <p className="card-goal">{phase.goal}</p>
      <div className="card-foot">
        <span className="chip"><span className="chip-prompt">›</span>{phase.deliverable.file}</span>
        <span className="expand">open ⤢</span>
      </div>

      {peeking && (
        <div className={"peek" + (index % COLS === COLS - 1 ? " peek-left" : "")}>
          <div className="peek-label">UNLOCKS</div>
          <div className="pills">
            {phase.concepts.map((c) => <span className="pill" key={c}>{c}</span>)}
          </div>
          <div className="peek-cta">{phase.plan.length} steps · click to expand →</div>
        </div>
      )}
    </a>
  );
}

/* ============================ Vertical timeline view ============================ */
function VerticalTimeline({ onOpen }) {
  return (
    <div className="board-wrap">
      <div className="timeline">
        {window.PHASES.map((p, i) => {
          const num = String(p.n).padStart(2, "0");
          return (
            <div className="tl-item" key={p.n}>
              <div className="tl-dot">{num}</div>
              <a
                className="tl-card"
                data-phase={p.n}
                href={phasePath(p.n)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
                  e.preventDefault();
                  onOpen(i);
                }}
              >
                {p.icon && <i className={"ph-duotone ph-" + p.icon + " phase-icon"} aria-hidden="true" />}
                <div className="tl-meta">
                  <span>{p.kicker}</span>
                  <span className="tl-sep">·</span>
                  <span>{p.plan.length} STEPS</span>
                </div>
                <h3 className="tl-title">{p.title}</h3>
                <p className="tl-goal">{p.goal}</p>
                <div className="tl-foot">
                  <span className="chip"><span className="chip-prompt">›</span>{p.deliverable.file}</span>
                  <div className="tl-pills">
                    {p.concepts.slice(0, 3).map((c) => <span className="pill" key={c}>{c}</span>)}
                  </div>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================ Mermaid diagram ============================ */
function Diagram({ text, idHint }) {
  const [svg, setSvg] = useState("");
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!text || !window.mermaid) {
      setError("Diagram unavailable");
      return;
    }
    const id = `mmd-${idHint}-${Math.random().toString(36).slice(2, 7)}`;
    window.mermaid.render(id, text)
      .then((res) => { if (!cancelled) setSvg(res.svg); })
      .catch((e) => {
        console.error("mermaid render failed:", e);
        if (!cancelled) setError("Couldn't render diagram");
      });
    return () => { cancelled = true; };
  }, [text, idHint]);

  // ESC closes the expanded modal first (capture phase so it pre-empts the App-level handler that closes the pane)
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [expanded]);

  if (error) return <div className="diagram"><div className="diagram-fallback">{error}</div></div>;

  return (
    <React.Fragment>
      <div
        className="diagram diagram-clickable"
        dangerouslySetInnerHTML={{ __html: svg }}
        role="button"
        tabIndex={0}
        aria-label="Expand diagram"
        onClick={() => setExpanded(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpanded(true); } }}
      />
      {expanded && (
        <div className="diagram-overlay" onClick={() => setExpanded(false)}>
          <div className="diagram-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <button className="diagram-close" onClick={() => setExpanded(false)} aria-label="Close">×</button>
            <div className="diagram-large" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        </div>
      )}
    </React.Fragment>
  );
}

/* ============================ Pane (right-side slider) ============================ */
function Pane({ phase, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  const num = String(phase.n).padStart(2, "0");

  return (
    <div className="pane-backdrop" onClick={onClose}>
      <div className="pane" role="dialog" aria-modal="true" tabIndex={-1} ref={ref}
           data-phase={phase.n}
           onClick={(e) => e.stopPropagation()}>
        <div className="pane-bar">
          <span className="pane-bar-label" aria-hidden="true">PHASE {num}</span>
          <button className="close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="pane-soon">
          <i className="ph-duotone ph-flask pane-soon-icon" aria-hidden="true" />
          <span><strong>More content coming soon.</strong> This phase is still a quick summary — the full interactive walkthrough (like Phases 1&nbsp;&amp;&nbsp;2) is on the way.</span>
        </div>

        <div className="m-head">
          <span className="m-num">{num}</span>
          <div className="m-head-text">
            <div className="m-kicker">PHASE {num} · {phase.kicker}</div>
            <h2 className="m-title">{phase.title}</h2>
          </div>
          {phase.icon && <i className={"ph-duotone ph-" + phase.icon + " pane-icon"} aria-hidden="true" />}
        </div>

        <div className="m-goal"><span className="m-tag">GOAL</span>{phase.goal}</div>

        <section className="m-section">
          <div className="m-label">// what this is</div>
          <div className="m-prose">
            {phase.what.map((p, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
            ))}
          </div>
        </section>

        {phase.diagram && (
          <section className="m-section">
            <div className="m-label">// at a glance</div>
            <Diagram text={phase.diagram} idHint={`p${phase.n}`} />
          </section>
        )}

        <section className="m-section">
          <div className="m-label">// the plan</div>
          <ol className="steps">
            {phase.plan.map((s, i) => (
              <li key={i}>
                <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
                <span dangerouslySetInnerHTML={{ __html: s }} />
              </li>
            ))}
          </ol>
        </section>

        <section className="m-section">
          <div className="m-label">// ask your coding assistant</div>
          <ul className="asks">
            {phase.research.map((q, i) => (
              <li className="ask" key={i}>
                <span className="ask-arrow">›</span>
                <span dangerouslySetInnerHTML={{ __html: q }} />
              </li>
            ))}
          </ul>
        </section>

        <section className="m-section">
          <div className="m-label">// what you'll have when you're done</div>
          <ul className="outs">
            {phase.outcomes.map((o, i) => (
              <li key={i}>
                <span className="out-check">✓</span>
                <span dangerouslySetInnerHTML={{ __html: o }} />
              </li>
            ))}
          </ul>
        </section>

        <div className="m-foot">
          <div className="m-deliver">
            <h4>// deliverable</h4>
            <span className="chip big"><span className="chip-prompt">›</span>{phase.deliverable.file}</span>
            <p>{phase.deliverable.desc}</p>
          </div>
          <div>
            <h4>// concepts unlocked</h4>
            <div className="pills">
              {phase.concepts.map((c) => <span className="pill" key={c}>{c}</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Lesson modal (full-screen, subtopic sidebar) ============================ */
// Animated next-token generation loop: predict a distribution → commit the top
// token → append it → repeat, then loop. Drives the "run it in a loop" intuition.
function GenLoop({ steps, prompt = "" }) {
  const N = steps.length;
  const [i, setI] = useState(0);            // words generated so far
  const [phase, setPhase] = useState("predict"); // predict | commit | done
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (phase === "predict") {
      t = setTimeout(() => setPhase("commit"), 1900);
    } else if (phase === "commit") {
      t = setTimeout(() => {
        if (i + 1 < N) { setI(i + 1); setPhase("predict"); }
        else { setPhase("done"); }
      }, 1500);
    } else { // done — hold on the full sentence, then restart the loop
      t = setTimeout(() => { setI(0); setPhase("predict"); }, 3000);
    }
    return () => clearTimeout(t);
  }, [i, phase, playing, N]);

  const shown = prompt + steps.slice(0, phase === "done" ? N : i).map((s) => s.add).join("");
  const cur = steps[Math.min(i, N - 1)];
  const max = Math.max(...cur.candidates.map((c) => c.p));
  const chosen = cur.candidates[0].tok;
  const live = phase !== "done";
  // the text that rides back into the model (truncated tail so the chip fits)
  const fbText = shown.length > 15 ? "…" + shown.slice(-13) : shown;
  const fbW = Math.max(48, fbText.length * 6.4 + 14);

  // the two arcs of the loop (model -> text on the right, text -> model on the left)
  const RIGHT = "M236 150 C322 138 322 66 298 54";
  const LEFT = "M42 54 C18 66 18 138 104 150";
  const caption = phase === "predict"
    ? "the model reads the whole text and predicts the next word"
    : phase === "commit"
      ? "the predicted word travels up and is appended to the text"
      : "the model predicted “end” — generation stops";

  return (
    <div className="gloop">
      <svg className="gloop-svg" viewBox="0 0 340 200" role="img" aria-label="next-word generation loop">
        <defs>
          <marker id="gloopArr" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" className="gloop-arrhead" />
          </marker>
        </defs>

        {/* the loop track */}
        <path d={RIGHT} className="gloop-arc" markerEnd="url(#gloopArr)" />
        <path d={LEFT} className="gloop-arc" markerEnd="url(#gloopArr)" />

        {/* text node (the output) */}
        <rect x="14" y="12" width="312" height="42" className="gloop-node" />
        <text x="14" y="9" className="gloop-svg-tag">the text so far</text>
        <text x="28" y="38" className="gloop-svg-text">{shown || "…"}{live && <tspan className="gloop-svg-caret">▌</tspan>}</text>

        {/* model node (the engine) */}
        <rect x="100" y="150" width="140" height="40" className={"gloop-node gloop-node-model" + (phase === "predict" ? " on" : "")} />
        <text x="170" y="174" className="gloop-svg-model">the model</text>

        {/* the whole text rides back into the model */}
        {phase === "predict" && (
          <g className="gloop-fbtok" key={"f" + i}>
            <rect x={-(fbW / 2)} y="-11" width={fbW} height="22" />
            <text x="0" y="4">{fbText}</text>
          </g>
        )}

        {/* the predicted word rides up the right arc into the text */}
        {phase === "commit" && (
          <g className="gloop-wtok" key={"w" + i}>
            <rect x="-23" y="-12" width="46" height="24" />
            <text x="0" y="5">{chosen.trim()}</text>
          </g>
        )}
      </svg>

      <div className="gloop-cap">{caption}</div>

      {live && (
        <div className="gloop-bars">
          {cur.candidates.map((c, k) => (
            <div className={"gloop-row" + (k === 0 ? " top" : "")} key={k}>
              <span className="gloop-tok">{c.tok}</span>
              <span className="gloop-bar"><span className="gloop-fill" style={{ width: (c.p / max * 100) + "%" }} /></span>
              <span className="gloop-p">{Math.round(c.p * 100)}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="gloop-ctrl">
        <button className="gloop-btn" onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ pause" : "▶ play"}</button>
        <button className="gloop-btn" onClick={() => { setI(0); setPhase("predict"); setPlaying(true); }}>↻ restart</button>
        <span className="gloop-step">token {phase === "done" ? N : Math.min(i + 1, N)} / {N}</span>
      </div>
    </div>
  );
}

// "Drive your assistant" activity: the prompt to paste into a coding assistant
// to build the phase's artifact — so readers never have to write code by hand.
function AssistBlock({ block }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(block.prompt).then(done).catch(done);
    } else { done(); }
  };
  return (
    <div className="assist">
      <div className="assist-head">
        <i className="ph-duotone ph-hammer assist-icon" aria-hidden="true" />
        <span className="assist-title">{block.title || "Build Activity"}</span>
      </div>
      {block.intro && <p className="assist-intro" dangerouslySetInnerHTML={{ __html: block.intro }} />}
      <div className="assist-prompt">
        <button className="assist-copy" onClick={copy}>{copied ? "copied ✓" : "copy"}</button>
        <pre><code>{block.prompt}</code></pre>
      </div>
      {block.asks && block.asks.length > 0 && (
        <div className="assist-asks">
          <div className="assist-asks-label">then, to understand what it built, ask:</div>
          <ul>{block.asks.map((q, i) => <li key={i} dangerouslySetInnerHTML={{ __html: q }} />)}</ul>
        </div>
      )}
      <a className="assist-setup" href="https://code.claude.com/docs/en/quickstart" target="_blank" rel="noopener noreferrer">
        New to Claude Code? Set it up in ~2 minutes ↗
      </a>
    </div>
  );
}

// Knowledge check — static multiple-choice or one-word, instant feedback.
function QuizItem({ item, index }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isMC = Array.isArray(item.options);
  const done = isMC ? picked !== null : revealed;
  return (
    <div className="quiz-item">
      <div className="quiz-q"><span className="quiz-n">Q{index + 1}</span><span dangerouslySetInnerHTML={{ __html: item.q }} /></div>
      {isMC ? (
        <div className="quiz-opts">
          {item.options.map((opt, k) => {
            let cls = "quiz-opt";
            if (picked !== null) {
              if (k === item.answer) cls += " correct";
              else if (k === picked) cls += " wrong";
            }
            const mark = picked !== null
              ? (k === item.answer ? "✓" : (k === picked ? "✗" : String.fromCharCode(65 + k)))
              : String.fromCharCode(65 + k);
            return (
              <button key={k} className={cls} disabled={picked !== null} onClick={() => setPicked(k)}>
                <span className="quiz-mark">{mark}</span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            );
          })}
        </div>
      ) : (
        <div className="quiz-reveal">
          {!revealed
            ? <button className="quiz-show" onClick={() => setRevealed(true)}>Show answer</button>
            : <div className="quiz-answer">{item.answer}</div>}
        </div>
      )}
      {done && item.explain && <div className="quiz-explain" dangerouslySetInnerHTML={{ __html: item.explain }} />}
    </div>
  );
}

function Quiz({ items }) {
  return (
    <div className="quiz">
      <div className="quiz-head"><i className="ph-duotone ph-check-square quiz-icon" aria-hidden="true" />Knowledge check</div>
      {items.map((it, i) => <QuizItem key={i} item={it} index={i} />)}
    </div>
  );
}

// Words placed on a 2D Cartesian plane by meaning; optional query highlights nearest.
// Point coords (x, y) are on a 0..10 scale; the component maps them to the plot.
function VectorSpace({ points, query }) {
  const COLORS = ["#5e8b6e", "#c2552b", "#3b6bb0", "#8a5da8"];
  const MX = 13, MY = 7, PW = 82, PH = 58;       // plot margins + size, in SVG units
  const X0 = MX, Y0 = MY + PH;                    // origin (bottom-left of the plot)
  const px = (dx) => MX + (dx / 10) * PW;         // data 0..10 -> svg x
  const py = (dy) => Y0 - (dy / 10) * PH;         // data 0..10 -> svg y (flip: up = bigger)
  const ticks = [0, 2, 4, 6, 8, 10];

  let nearIdx = [];
  if (query) {
    nearIdx = points
      .map((p, i) => ({ i, d: Math.hypot(p.x - query.x, p.y - query.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, query.nearest || 3)
      .map((o) => o.i);
  }
  const nearSet = new Set(nearIdx);

  return (
    <div className="vspace">
      <svg viewBox="0 0 100 78" className="vspace-svg" role="img" aria-label="words placed on a 2D plane by meaning">
        {/* grid */}
        {ticks.map((t) => (
          <g key={"g" + t}>
            <line x1={px(t)} y1={MY} x2={px(t)} y2={Y0} className="vspace-grid" />
            <line x1={X0} y1={py(t)} x2={X0 + PW} y2={py(t)} className="vspace-grid" />
          </g>
        ))}
        {/* axes */}
        <line x1={X0} y1={Y0} x2={X0 + PW + 3} y2={Y0} className="vspace-axis" />
        <line x1={X0} y1={Y0} x2={X0} y2={MY - 3} className="vspace-axis" />
        {/* tick numbers */}
        {ticks.map((t) => (
          <g key={"t" + t}>
            <text x={px(t)} y={Y0 + 5} className="vspace-tick" textAnchor="middle">{t}</text>
            {t > 0 && <text x={X0 - 2.5} y={py(t) + 1} className="vspace-tick" textAnchor="end">{t}</text>}
          </g>
        ))}
        <text x={X0 + PW + 5} y={Y0 + 1.2} className="vspace-axislbl">x</text>
        <text x={X0} y={MY - 5} className="vspace-axislbl" textAnchor="middle">y</text>
        {/* query distance lines */}
        {query && nearIdx.map((i) => (
          <line key={"l" + i} x1={px(query.x)} y1={py(query.y)} x2={px(points[i].x)} y2={py(points[i].y)} className="vspace-line" />
        ))}
        {/* points */}
        {points.map((p, k) => (
          <g key={k} className={"vspace-pt" + (nearSet.has(k) ? " near" : "")}>
            <circle cx={px(p.x)} cy={py(p.y)} r={nearSet.has(k) ? 1.5 : 1.2} fill={COLORS[(p.g || 0) % COLORS.length]} />
            <text x={px(p.x) + 2} y={py(p.y) + 1} className="vspace-lbl">{p.label}</text>
          </g>
        ))}
        {/* query point */}
        {query && (
          <g className="vspace-query">
            <circle cx={px(query.x)} cy={py(query.y)} r="1.9" />
            <text x={px(query.x) + 2.4} y={py(query.y) + 1} className="vspace-qlbl">{query.label}</text>
          </g>
        )}
      </svg>
      {query && <div className="vspace-cap">nearest by distance → {nearIdx.map((i) => points[i].label).join(", ")}</div>}
    </div>
  );
}

// Shared play/pause/restart bar for the flow animations below.
function FlowCtrl({ playing, setPlaying, onRestart, step, total }) {
  return (
    <div className="flowctrl">
      <button className="flowctrl-btn" onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ pause" : "▶ play"}</button>
      <button className="flowctrl-btn" onClick={onRestart}>↻ restart</button>
      <span className="flowctrl-step">step {step + 1} / {total}</span>
    </div>
  );
}

// Ingestion: a document fans out into chunks, each converges into the
// embedding model, morphs from text into a vector, and lands in the DB —
// with a live "N of M stored" counter. State-driven positions + CSS
// transitions (not keyframes), so pause/restart are just state, not timing math.
function IngestFlow({ doc = "100s of docs", chunkCount = 3 }) {
  const N = 6; // stages 0..5
  const GAPS = [1350, 1550, 1550, 750, 1650];   // slower — time to actually read each move
  const HOLD = 2900;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [stored, setStored] = useState(0);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => { setStage(0); setStored(0); }, HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  useEffect(() => {
    if (stage !== 5) return;
    const timers = Array.from({ length: chunkCount }, (_, i) =>
      setTimeout(() => setStored((s) => Math.min(chunkCount, s + 1)), i * 180 + 320));
    return () => timers.forEach(clearTimeout);
  }, [stage, chunkCount]);

  const DOC = { x: 30, y: 74 };
  const EMBED = { x: 170, y: 70 };
  const span = Math.max(1, chunkCount - 1);
  const slot = (i) => ({ x: 95, y: 28 + i * (84 / span) });
  const dbSlot = (i) => ({ x: 270, y: 50 + i * (40 / span) });

  const posFor = (i) => {
    if (stage <= 1) return DOC;
    if (stage === 2) return slot(i);
    return stage <= 4 ? EMBED : dbSlot(i);
  };
  const scaleFor = stage === 0 ? 0.3 : (stage >= 4 ? 0.82 : 1);
  const rectOpacity = stage >= 1 && stage <= 3 ? 1 : 0;
  const dotOpacity = stage >= 4 ? 1 : 0;

  const CAPTIONS = [
    "hundreds of documents, ready to split",
    "hundreds of documents, ready to split",
    "splitting into chunks",
    "each chunk enters the embedding model",
    "each chunk becomes a vector",
    stored + " of " + chunkCount + " chunks stored",
  ];
  // small floating annotations, positioned above the part of the diagram that's active
  const annOn = (a, b) => stage >= a && stage <= b;

  // a fanned stack of cards behind the front doc, to read as "hundreds", not one file
  const STACK = [{ dx: -10, dy: 10 }, { dx: -6, dy: 6 }, { dx: -3, dy: 3 }, { dx: 0, dy: 0 }];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 320 150" className="iflow-svg" role="img" aria-label="hundreds of documents splitting into chunks, each embedded and stored in a vector database">
        <g className="ifl-doc">
          {STACK.map((c, k) => (
            <rect key={k} className={k === STACK.length - 1 ? "ifl-card front" : "ifl-card"}
                  x={DOC.x - 15 + c.dx} y={DOC.y - 15 + c.dy} width="30" height="30" />
          ))}
          <text x={DOC.x} y={DOC.y + 34} textAnchor="middle">{doc}</text>
        </g>
        <text x={DOC.x} y="16" textAnchor="middle" className={"ifl-ann" + (annOn(1, 2) ? " on" : "")}>splitting each doc into chunks</text>

        <g className="ifl-embed">
          <rect x={EMBED.x - 38} y={EMBED.y - 25} width="76" height="50" />
          <text x={EMBED.x} y={EMBED.y + 40} textAnchor="middle">embedding model</text>
        </g>
        <text x={EMBED.x} y="16" textAnchor="middle" className={"ifl-ann" + (annOn(3, 4) ? " on" : "")}>chunk → vector</text>

        <g className="ifl-db">
          <rect x="250" y="42" width="40" height="56" rx="5" />
          <ellipse cx="270" cy="42" rx="20" ry="6" />
          <text x="270" y="128" textAnchor="middle">vector DB</text>
        </g>
        <text x="270" y="16" textAnchor="middle" className={"ifl-ann" + (stage === 5 ? " on" : "")}>stored as points, by meaning</text>

        {Array.from({ length: chunkCount }, (_, i) => {
          const p = posFor(i);
          return (
            <g key={i} className="ifl-piece"
               style={{ transform: `translate(${p.x}px, ${p.y}px) scale(${scaleFor})`, transitionDelay: (i * 130) + "ms" }}>
              <rect className="ifl-chunk" x="-8" y="-6" width="16" height="12" style={{ opacity: rectOpacity }} />
              <circle className="ifl-dot" r="4" style={{ opacity: dotOpacity }} />
            </g>
          );
        })}
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => { setStage(0); setStored(0); setPlaying(true); }}
        step={stage} total={N} />
    </div>
  );
}

// Query: the question travels to the embedding model, becomes a vector, and
// lands beside its nearest stored chunk in a mini vector space — then that
// chunk combines with the question and the model answers.
function QueryFlow({ question = "“parental leave?”", nearestLabel = "leave policy", chunkPreview = "“18 weeks paid…”", answer = "18 weeks paid ✓" }) {
  const N = 10; // stages 0..9
  const GAPS = [1150, 1350, 750, 1450, 1350, 1500, 1350, 1250, 1250];   // slower throughout
  const HOLD = 3000;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => setStage(0), HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const START = { x: 30, y: 90 };
  const EMBED = { x: 105, y: 55 };
  const NEAR_TARGET = { x: 222, y: 66 };

  // all four chunks already sitting in the vector space, before the question ever arrives
  const POINTS = [
    { key: "leave", label: nearestLabel, x: 245, y: 60, dist: 0.4 },
    { key: "vacation", label: "vacation days", x: 192, y: 34, dist: 2.1 },
    { key: "expense", label: "expense caps", x: 322, y: 30, dist: 3.6 },
    { key: "wifi", label: "wifi setup", x: 316, y: 88, dist: 4.3 },
  ];
  const nearest = POINTS.reduce((a, b) => (a.dist < b.dist ? a : b));

  const pos = stage <= 1 ? START : (stage <= 3 ? EMBED : NEAR_TARGET);
  const scale = stage === 0 ? 0.3 : (stage >= 4 ? 0.85 : 1);
  // size the chip to the full question text, with real padding either side, not a fixed crop
  const chipW = Math.max(56, question.length * 5.4 + 26);
  const chipOpacity = stage >= 1 && stage <= 2 ? 1 : 0;
  const dotOpacity = stage >= 3 ? 1 : 0;
  const linesOn = stage >= 5;     // draw distance to every stored chunk
  const wonOn = stage >= 6;       // highlight the closest one, dim the rest
  const promptOn = stage >= 7;
  const llmOn = stage >= 8;
  const answerOn = stage >= 9;

  const CAPTIONS = [
    "a new question comes in",
    "a new question comes in",
    "embed the question",
    "embed the question",
    "now it's a point, in the same space as everything stored",
    "measuring distance to every stored chunk",
    nearest.label + " is nearest — that's the match",
    "paste that chunk in front of the question",
    "the model reads it",
    "grounded answer",
  ];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 360 175" className="iflow-svg" role="img" aria-label="a question embedded, compared by distance to every stored chunk, and answered using the nearest one">
        <g className="ifl-embed">
          <rect x={EMBED.x - 38} y={EMBED.y - 25} width="76" height="50" />
          <text x={EMBED.x} y={EMBED.y + 40} textAnchor="middle">embedding model</text>
        </g>
        <rect x="165" y="15" width="180" height="90" className="qfl-vbox" />
        <text x="255" y="9" textAnchor="middle" className="qfl-vboxlbl">already stored, as points</text>

        {POINTS.map((pt) => {
          const isNear = pt.key === nearest.key;
          const wonClass = wonOn ? (isNear ? " win" : " dim") : "";
          return (
            <g key={pt.key}>
              <line x1={NEAR_TARGET.x} y1={NEAR_TARGET.y} x2={pt.x} y2={pt.y}
                    className={"qfl-distline" + (linesOn ? " on" : "") + wonClass} />
              <text x={(NEAR_TARGET.x + pt.x) / 2} y={(NEAR_TARGET.y + pt.y) / 2 - 3} textAnchor="middle"
                    className={"qfl-distlabel" + (linesOn ? " on" : "") + wonClass}>{pt.dist.toFixed(1)}</text>
              <circle cx={pt.x} cy={pt.y} r={isNear && wonOn ? 4.2 : 3} className={"qfl-pt" + wonClass} />
              <text x={pt.x + 6} y={pt.y + 3} className={"qfl-ptlabel" + wonClass}>{pt.label}</text>
            </g>
          );
        })}

        <g className="ifl-piece" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}>
          <g style={{ opacity: chipOpacity }}>
            <rect className="qfl-chip" x={-chipW / 2} y="-13" width={chipW} height="26" />
            <text className="qfl-chiptxt" x="0" y="4" textAnchor="middle">{question}</text>
          </g>
          <circle className="qfl-dot" r="5" style={{ opacity: dotOpacity }} />
        </g>
        <g className={"qfl-prompt" + (promptOn ? " on" : "")}>
          <rect x="15" y="126" width="152" height="38" />
          <text x="91" y="143" textAnchor="middle">{question}</text>
          <text x="91" y="158" textAnchor="middle" className="qfl-promptchunk">+ {chunkPreview}</text>
        </g>
        <text x="180" y="150" textAnchor="middle" className={"qfl-arrow" + (llmOn ? " on" : "")}>→</text>
        <g className={"qfl-llm" + (llmOn ? " on" : "")}>
          <rect x="193" y="126" width="58" height="38" />
          <text x="222" y="150" textAnchor="middle">LLM</text>
        </g>
        <text x="264" y="150" textAnchor="middle" className={"qfl-arrow" + (answerOn ? " on" : "")}>→</text>
        <text x="278" y="150" className={"qfl-answer" + (answerOn ? " on" : "")}>{answer}</text>
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => setStage(0)}
        step={stage} total={N} />
    </div>
  );
}

// The agent loop, corrected: the LLM only ever decides — it never touches a
// tool. The harness (your code) is what carries the message to the model
// (a remote API call), runs the real tool when asked, and carries results
// back. "Deciding what to do" reuses the same predict-bars look as Phase 1's
// next-token widget, because picking a tool IS just another prediction.
function AgentLoopFlow({ question = "8,347 × 219?", toolName = "calculator", toolCall = "calculator(8347, 219)", toolResult = "1,828,993", finalAnswer = "1,828,993 ✓" }) {
  const N = 8; // stages 0..7
  const GAPS = [950, 1250, 1350, 2300, 950, 1350, 2300];
  const HOLD = 3000;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => setStage(0), HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const USER = { x: 32, y: 26 };
  const INTAKE = { x: 55, y: 108 };
  const LLM = { x: 300, y: 45 };
  const TOOL = { x: 220, y: 148 };

  const posFor = () => {
    if (stage <= 1) return USER;
    if (stage === 2) return INTAKE;
    if (stage <= 3) return LLM;
    if (stage <= 5) return TOOL;
    if (stage === 6) return LLM;
    return USER;
  };
  const labelFor = () => {
    if (stage <= 2) return question;
    if (stage === 3) return "question + tool list";
    if (stage === 4) return toolCall;
    if (stage === 5) return toolResult;
    if (stage === 6) return "tool result: " + toolResult;
    return finalAnswer;
  };
  const pos = posFor();
  const scale = stage === 0 ? 0.3 : 1;
  const pieceW = Math.max(56, labelFor().length * 5 + 20);

  const D1 = [{ tok: "call " + toolName, p: 0.82 }, { tok: "answer now", p: 0.1 }, { tok: "call search", p: 0.08 }];
  const D2 = [{ tok: "answer now", p: 0.88 }, { tok: "call " + toolName + " again", p: 0.07 }, { tok: "call search", p: 0.05 }];
  const thinking = stage === 3 ? D1 : (stage === 6 ? D2 : null);
  const thinkMax = thinking ? Math.max(...thinking.map((c) => c.p)) : 1;

  const CAPTIONS = [
    "a question comes in",
    "a question comes in",
    "the harness receives it, and adds the tool list",
    "the LLM decides what to do — just another prediction, like Phase 1",
    "the harness — never the LLM — runs the real tool",
    "the tool computes a real result",
    "the result goes back to the LLM, which decides again",
    "“answer now” wins — the harness returns the final answer",
  ];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 380 195" className="iflow-svg al-svg" role="img" aria-label="an agent loop: the harness relays a question to the LLM, runs the tool the LLM asks for, and returns the final answer">
        <g className="al-llm">
          <rect x={LLM.x - 42} y={LLM.y - 24} width="84" height="48" />
          <text x={LLM.x} y={LLM.y - 30} textAnchor="middle" className="al-taglabel">the LLM — an API call away</text>
          <text x={LLM.x} y={LLM.y + 5} textAnchor="middle">only decides</text>
        </g>
        <g className="al-harness">
          <rect x="14" y="92" width="230" height="90" />
          <text x="20" y="86" className="al-taglabel">the harness — your code</text>
          <g className="al-tool">
            <rect x={TOOL.x - 45} y={TOOL.y - 20} width="90" height="40" />
            <text x={TOOL.x} y={TOOL.y + 5} textAnchor="middle">{toolName}()</text>
          </g>
        </g>
        <text x={USER.x} y={USER.y - 12} className="al-taglabel">you</text>

        {thinking && (
          <g className="al-bars" style={{ transform: `translate(${LLM.x - 45}px, ${LLM.y + 34}px)` }}>
            {thinking.map((c, k) => (
              <g key={k} transform={`translate(0, ${k * 13})`}>
                <text className="al-tok" x="0" y="6" textAnchor="end">{c.tok}</text>
                <rect className="al-bar-bg" x="4" y="0" width="60" height="9" />
                <rect className="al-bar-fill" x="4" y="0" width={(c.p / thinkMax) * 60} height="9" />
                <text className="al-p" x="70" y="6">{Math.round(c.p * 100)}%</text>
              </g>
            ))}
          </g>
        )}

        <g className="ifl-piece al-piece" style={{ transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})` }}>
          <rect className="al-chip" x={-pieceW / 2} y="-12" width={pieceW} height="24" />
          <text className="al-chiptxt" x="0" y="4" textAnchor="middle">{labelFor()}</text>
        </g>
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => setStage(0)}
        step={stage} total={N} />
    </div>
  );
}

// Evals: a golden dataset of Q&A pairs runs — one case at a time — through
// the RAG system; a checker compares "got" vs "want", and a scoreboard fills
// up. One case fails on purpose, because finding that is the whole point.
function EvalFlow() {
  const CASES = [
    { q: "parental leave?", ans: "18 weeks", exp: "18 weeks", pass: true },
    { q: "refund window?", ans: "30 days", exp: "30 days", pass: true },
    { q: "shipping cutoff?", ans: "2 pm", exp: "noon", pass: false },
    { q: "wifi password?", ans: "not in the docs", exp: "not in the docs", pass: true },
  ];
  const SUBS = 5;
  const N = 2 + CASES.length * SUBS; // intro + 5 beats per case + final score
  const GAPS = [1700].concat(CASES.map(() => [1300, 1400, 1500, 1600, 1600]).flat());
  const HOLD = 3600;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => setStage(0), HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const DATA = { x: 44, y: 56 };
  const RAG = { x: 143, y: 60 };
  const GOT = { x: 287, y: 44 };   // "got" row inside the checker
  const WANT = { x: 287, y: 72 };  // "want" row inside the checker

  const ci = stage === 0 ? -1 : Math.min(CASES.length - 1, Math.floor((stage - 1) / SUBS));
  const sub = ci < 0 ? -1 : (stage - 1) - ci * SUBS; // 0..4, or 5 on the final stage
  const cur = ci >= 0 ? CASES[ci] : CASES[0];
  const chipW = (t) => Math.max(42, t.length * 4.7 + 16);

  // the three moving chips of the current case (keyed by ci, so each case starts fresh)
  const qPos = sub >= 1 ? RAG : DATA;
  const qOn = sub >= 0 && sub <= 1;
  const aPos = sub >= 2 ? GOT : RAG;
  const aOn = sub >= 2 && sub <= 4;
  const ePos = sub >= 3 ? WANT : DATA;
  const eOn = sub >= 3 && sub <= 4;
  const verdictNow = sub >= 4; // color the "got" chip green/red once compared
  const markOn = (i) => stage >= 1 + i * SUBS + 4; // verdicts persist on the scoreboard

  const CAPTIONS = ["a golden dataset: 4 questions with known-correct answers"]
    .concat(CASES.map((c, i) => [
      "test " + (i + 1) + " of 4: “" + c.q + "”",
      "the question runs through your RAG system",
      "the system answers: “" + c.ans + "”",
      "the dataset expected: “" + c.exp + "”",
      c.pass ? (i === 3 ? "match — refusing to guess was the right answer ✓" : "match ✓")
             : "mismatch ✗ — a real bug, found automatically",
    ]).flat())
    .concat(["3 / 4 passed — the score points you at exactly what to fix"]);

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 350 162" className="iflow-svg" role="img" aria-label="a golden dataset of question and answer pairs run through the RAG system; a checker compares each answer with the expected one and fills a scoreboard">
        {/* golden dataset — a fanned stack of Q&A cards */}
        <g className="ifl-doc">
          {[{ dx: -8, dy: 8 }, { dx: -4, dy: 4 }, { dx: 0, dy: 0 }].map((c, k) => (
            <rect key={k} className={k === 2 ? "ifl-card front" : "ifl-card"}
                  x={DATA.x - 14 + c.dx} y={DATA.y - 14 + c.dy} width="28" height="28" />
          ))}
          <text x={DATA.x - 4} y={DATA.y + 32} textAnchor="middle">golden dataset</text>
          <text x={DATA.x - 4} y={DATA.y + 43} textAnchor="middle" className="ev-sub">4 Q + expected-answer pairs</text>
        </g>

        {/* the system under test */}
        <g className="ifl-embed">
          <rect x={RAG.x - 39} y={RAG.y - 20} width="78" height="40" />
          <text x={RAG.x} y={RAG.y + 34} textAnchor="middle">your RAG system</text>
        </g>
        <text x={RAG.x} y="30" textAnchor="middle" className={"ifl-ann" + (sub === 1 ? " on" : "")}>running the pipeline</text>

        {/* the checker — compares got vs want */}
        <g className="ev-check">
          <rect x="210" y="28" width="132" height="60" />
          <text x="210" y="21" className="al-taglabel">checker</text>
          <text x="218" y={GOT.y + 2.5} className="ev-rowlbl">got</text>
          <text x="218" y={WANT.y + 2.5} className="ev-rowlbl">want</text>
        </g>
        <text x="276" y="14" textAnchor="middle" className={"ifl-ann" + (sub >= 2 && sub <= 4 ? " on" : "")}>compare, word for word</text>

        {/* scoreboard — one slot per test, verdicts stay put */}
        <g className="ev-board">
          {CASES.map((c, i) => (
            <g key={i}>
              <rect className="ev-slot" x={224 + i * 30} y="112" width="22" height="22" />
              <text className={"ev-mark " + (c.pass ? "pass" : "fail") + (markOn(i) ? " on" : "")}
                    x={235 + i * 30} y="128" textAnchor="middle">{c.pass ? "✓" : "✗"}</text>
            </g>
          ))}
          <text x="279" y="150" textAnchor="middle" className="al-taglabel">scoreboard</text>
        </g>

        {/* moving chips for the current case — remounted per case via key */}
        {ci >= 0 && (
          <g key={ci}>
            <g className="ev-piece" style={{ transform: `translate(${qPos.x}px, ${qPos.y}px) scale(${sub === 0 ? 0.6 : 1})`, opacity: qOn ? 1 : 0 }}>
              <rect className="ev-chip" x={-chipW(cur.q) / 2} y="-9" width={chipW(cur.q)} height="18" />
              <text className="ev-chiptxt" x="0" y="3" textAnchor="middle">{cur.q}</text>
            </g>
            <g className="ev-piece" style={{ transform: `translate(${aPos.x}px, ${aPos.y}px)`, opacity: aOn ? 1 : 0 }}>
              <rect className={"ev-chip" + (verdictNow ? (cur.pass ? " ok" : " bad") : "")}
                    x={-chipW(cur.ans) / 2} y="-9" width={chipW(cur.ans)} height="18" />
              <text className="ev-chiptxt" x="0" y="3" textAnchor="middle">{cur.ans}</text>
            </g>
            <g className="ev-piece" style={{ transform: `translate(${ePos.x}px, ${ePos.y}px)`, opacity: eOn ? 1 : 0 }}>
              <rect className="ev-chip exp" x={-chipW(cur.exp) / 2} y="-9" width={chipW(cur.exp)} height="18" />
              <text className="ev-chiptxt" x="0" y="3" textAnchor="middle">{cur.exp}</text>
            </g>
          </g>
        )}
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => { setStage(0); setPlaying(true); }}
        step={stage} total={N} />
    </div>
  );
}

// Observability: one request travels you → search docs → LLM → answer, and
// below, a mini flame chart draws itself — each step's bar grows to a width
// proportional to its time, with its cost attached. The trace is the diary.
function TraceFlow() {
  const N = 6;
  const GAPS = [1500, 2200, 2300, 1600, 2000];
  const HOLD = 3600;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => setStage(0), HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const STEPS = [
    { label: "you", x: 34, w: 44 },
    { label: "search docs", x: 114, w: 66 },
    { label: "LLM", x: 198, w: 44 },
    { label: "answer", x: 288, w: 56 },
  ]; // box centers, boxes span y 22..52
  const BY = 37;

  const chipStep = Math.min(stage, 3);
  const chipText = stage <= 2 ? "parental leave?" : "18 weeks ✓";
  const chipW = Math.max(48, chipText.length * 4.7 + 16);

  // flame chart: 100px per second, so widths are honestly proportional
  const T0 = 92, PXS = 100;
  const ROWS = [
    { name: "search docs", note: "0.4s · $0", x: T0, w: 0.4 * PXS, y: 82, at: 1, inside: false },
    { name: "LLM call", note: "1.8s · $0.003", x: T0 + 0.4 * PXS, w: 1.8 * PXS, y: 100, at: 2, inside: true },
  ];
  const TOT = { name: "whole request", note: "2.3s · $0.003", x: T0, w: 2.3 * PXS, y: 124, at: 4, inside: true };

  const bar = (r, cls) => (
    <g key={r.name}>
      <text className="trf-rowname" x={T0 - 6} y={r.y + 8.5} textAnchor="end">{r.name}</text>
      <rect className="trf-lane" x={T0} y={r.y} width="230" height="11" />
      <rect className={"trf-bar" + cls} x={r.x} y={r.y} height="11" width={stage >= r.at ? r.w : 0} />
      <text className={"trf-note" + (r.inside ? " inside" : "") + (stage >= r.at ? " on" : "")}
            x={r.inside ? r.x + r.w - 5 : r.x + r.w + 5} y={r.y + 8.5}
            textAnchor={r.inside ? "end" : "start"}>{r.note}</text>
    </g>
  );

  const CAPTIONS = [
    "a request comes in — and a stopwatch starts",
    "step 1: search docs — logged: 0.4s · $0",
    "step 2: the LLM call — logged: 1.8s · $0.003",
    "the answer heads back: “18 weeks”",
    "add the steps: whole request — 2.3s · $0.003",
    "this is a trace — the request's diary",
  ];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 340 152" className="iflow-svg" role="img" aria-label="a request travels from you through search docs and an LLM call to the answer, while a timeline below records each step's duration and cost as a trace">
        {/* the request's path */}
        {STEPS.map((s, i) => (
          <g key={s.label} className="trf-box">
            <rect x={s.x - s.w / 2} y="22" width={s.w} height="30" />
            <text x={s.x} y={BY + 3} textAnchor="middle">{s.label}</text>
            {i > 0 && <text className="trf-flow" x={(s.x - s.w / 2 + STEPS[i - 1].x + STEPS[i - 1].w / 2) / 2} y={BY + 3} textAnchor="middle">→</text>}
          </g>
        ))}
        <g className="ifl-piece" style={{ transform: `translate(${STEPS[chipStep].x}px, ${BY}px) scale(${stage === 0 ? 0.72 : 1})` }}>
          <rect className="trf-chip" x={-chipW / 2} y="-9" width={chipW} height="18" />
          <text className="trf-chiptxt" x="0" y="3" textAnchor="middle">{chipText}</text>
        </g>

        {/* the trace — a mini flame chart that draws itself */}
        <text x="8" y="72" className="al-taglabel">the trace — every step, timed and priced</text>
        {[0, 1, 2].map((s) => (
          <g key={"t" + s}>
            <line className="trf-grid" x1={T0 + s * PXS} y1="78" x2={T0 + s * PXS} y2="138" />
            <text className="trf-tick" x={T0 + s * PXS} y="147" textAnchor="middle">{s}s</text>
          </g>
        ))}
        {ROWS.map((r) => bar(r, ""))}
        <line className="trf-sep" x1="8" y1="117" x2="332" y2="117" />
        {bar(TOT, " total")}
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => { setStage(0); setPlaying(true); }}
        step={stage} total={N} />
    </div>
  );
}

// Guardrails: three gates in a row. A prompt-injection bounces off gate 1,
// a policy question is refused by the model at gate 2, and a legitimate
// question sails through all three and exits green.
function GateFlow() {
  const N = 13;
  const GAPS = [1500, 1500, 2100, 1500, 1400, 1500, 2100, 1500, 1300, 1400, 1700, 1700];
  const HOLD = 3400;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [run, setRun] = useState(0); // chips remount per run, so restarts don't animate backwards

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => { setStage(0); setRun((r) => r + 1); }, HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const GATES = [
    { label: "input check", x: 130 },
    { label: "model + rules", x: 208 },
    { label: "output check", x: 286 },
  ]; // boxes are 64 wide, y 38..94
  const GY = 110; // chips travel in a clear lane below the boxes so gate labels stay readable
  const START = { x: 50, y: GY };
  const SLOT = { x: 300, y: 154 };
  const chipW = (t) => Math.max(44, t.length * 4.3 + 14);

  // per-attempt chip state, all three always mounted so CSS transitions run
  const chips = [
    (() => { // attempt 1 — blocked at gate 1
      const pos = stage <= 0 ? START : stage === 1 ? { x: GATES[0].x, y: GY } : { x: GATES[0].x, y: 124 };
      return { text: "“ignore your rules…”", pos, on: stage >= 0 && stage <= 1, drop: stage >= 2, bad: stage >= 2, ok: false, scale: stage === 0 ? 0.7 : 1 };
    })(),
    (() => { // attempt 2 — passes gate 1, refused at gate 2
      const pos = stage <= 3 ? START : stage === 4 ? { x: GATES[0].x, y: GY } : stage === 5 ? { x: GATES[1].x, y: GY } : { x: GATES[1].x, y: 124 };
      return { text: "“my coworker's salary?”", pos, on: stage >= 3 && stage <= 5, drop: stage >= 6, bad: stage >= 6, ok: false, scale: stage === 3 ? 0.7 : 1 };
    })(),
    (() => { // attempt 3 — through all three gates, out as a safe answer
      const pos = stage <= 7 ? START : stage === 8 ? { x: GATES[0].x, y: GY } : stage === 9 ? { x: GATES[1].x, y: GY } : stage === 10 ? { x: GATES[2].x, y: GY } : SLOT;
      const text = stage <= 9 ? "“where is order #4412?”" : stage >= 11 ? "on a truck, arrives Tue ✓" : "on a truck, arrives Tue";
      return { text, pos, on: stage >= 7, drop: false, bad: false, ok: stage >= 11, scale: stage === 7 ? 0.7 : 1 };
    })(),
  ];

  const gateCls = (i) => {
    const block = (i === 0 && stage === 2) || (i === 1 && stage === 6);
    const pass = (i === 0 && ((stage >= 4 && stage <= 6) || (stage >= 8 && stage <= 11))) ||
                 (i === 1 && stage >= 10 && stage <= 11) ||
                 (i === 2 && stage === 11);
    return "gf-gate" + (block ? " block" : "") + (pass ? " pass" : "");
  };

  const CAPTIONS = [
    "attempt 1: “ignore your rules…”",
    "the input check reads it before anything else does",
    "blocked before the model ever sees it",
    "attempt 2: “my coworker's salary?”",
    "input check: looks like a normal question — through",
    "the model + its rules read it…",
    "…and refuse — layer 2 catches what layer 1 couldn't",
    "attempt 3: “where is order #4412?”",
    "input check: fine",
    "the model looks up the order and drafts an answer",
    "output check: no private data in the reply — through",
    "a safe, useful answer comes out ✓",
    "three layers — each catches what the previous one missed",
  ];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 380 190" className="iflow-svg al-svg" role="img" aria-label="three guardrail layers: an input check blocks a prompt injection, the model refuses a policy violation, and a legitimate question passes all three gates">
        {GATES.map((g, i) => (
          <g key={g.label} className={gateCls(i)}>
            <text className="al-taglabel" x={g.x} y="30" textAnchor="middle">layer {i + 1}</text>
            <rect x={g.x - 32} y="38" width="64" height="56" />
            <text className="gf-gatelbl" x={g.x} y="69" textAnchor="middle">{g.label}</text>
          </g>
        ))}
        <text className="al-taglabel" x={START.x} y="96" textAnchor="middle">requests</text>
        <g className="gf-slot">
          <rect x="226" y="140" width="148" height="28" />
          <text className="al-taglabel" x="374" y="134" textAnchor="end">answer</text>
        </g>
        <text x="300" y="182" textAnchor="middle" className={"ifl-ann" + (stage === 11 ? " on" : "")}>safe to show the user</text>

        {chips.map((c, i) => (
          <g key={run + "-" + i} className={"gf-piece" + (c.drop ? " drop" : "")}
             style={{ transform: `translate(${c.pos.x}px, ${c.pos.y}px) scale(${c.scale})`, opacity: c.drop ? 0 : (c.on ? 1 : 0) }}>
            <rect className={"gf-chip" + (c.bad ? " bad" : "") + (c.ok ? " ok" : "")}
                  x={-chipW(c.text) / 2} y="-9" width={chipW(c.text)} height="18" />
            <text className="gf-chiptxt" x="0" y="3" textAnchor="middle">{c.text}</text>
          </g>
        ))}
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => { setStage(0); setRun((r) => r + 1); setPlaying(true); }}
        step={stage} total={N} />
    </div>
  );
}

// Compaction: messages append into a fixed context window until it's nearly
// full — then the oldest four converge into one short amber summary, visibly
// freeing room, and the conversation keeps appending.
function CompactFlow() {
  const N = 8;
  const GAPS = [1600, 1500, 1600, 2100, 2300, 1700, 1800];
  const HOLD = 3600;
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (stage < N - 1) t = setTimeout(() => setStage((s) => s + 1), GAPS[stage]);
    else t = setTimeout(() => setStage(0), HOLD);
    return () => clearTimeout(t);
  }, [stage, playing]);

  const X0 = 24, PITCH = 41, MW = 36, CY = 68;
  const SUMX = 54; // summary block center (block is 64 wide: 22..86)
  const preX = (i) => X0 + i * PITCH + MW / 2;
  const postX = (i) => 92 + (i - 4) * PITCH + MW / 2;

  const msgs = Array.from({ length: 8 }, (_, i) => {
    const role = i % 2 === 0 ? "you" : "agent";
    const appearAt = i < 2 ? 1 : i < 4 ? 2 : i < 6 ? 3 : 6;
    let cx = preX(i), scale = 1, gone = false;
    if (i < 4 && stage >= 4) { cx = SUMX; scale = 0.15; gone = true; }       // merge into the summary
    if (i >= 4 && i < 6 && stage >= 5) cx = postX(i);                        // slide into freed space
    if (i >= 6) cx = postX(i);                                              // append after the summary
    return { i, role, cx, scale, gone, on: stage >= appearAt };
  });

  // usage gauge, in real pixels of window used — drops visibly at compaction
  const GW = [0, 83, 165, 247, 151, 151, 233, 233][stage];
  const pct = Math.round((GW / 304) * 100);
  const nearlyFull = stage === 3;

  const CAPTIONS = [
    "the context window — fixed size, with a hard edge",
    "every turn appends a message",
    "…and the window only ever fills up",
    "the window is nearly full",
    "compaction: the oldest 4 messages merge into one summary",
    "the summary holds the gist — at a fraction of the size",
    "two more messages fit in the freed room",
    "old detail becomes a short summary; the conversation keeps going",
  ];

  return (
    <div className="iflow">
      <div className="iflow-cap">{CAPTIONS[stage]}</div>
      <svg viewBox="0 0 340 128" className="iflow-svg" role="img" aria-label="messages fill a fixed context window until nearly full, then the oldest four merge into one short summary, freeing room for the conversation to continue">
        <text x="18" y="34" className="al-taglabel">context window</text>
        <text x="322" y="34" textAnchor="end" className="al-taglabel">capacity</text>
        <rect className="cf-win" x="18" y="44" width="304" height="48" />
        <line className="cf-edge" x1="322" y1="40" x2="322" y2="96" />
        <rect className={"cf-zone" + (nearlyFull ? " on" : "")} x="20" y="46" width="247" height="44" />

        {/* the summary block — appears where the old messages converge */}
        <g className={"cf-sum" + (stage >= 4 ? " on" : "")} style={{ transform: `translate(${SUMX}px, ${CY}px)` }}>
          <rect x="-32" y="-18" width="64" height="36" />
          <text x="0" y="-3" textAnchor="middle">summary of</text>
          <text x="0" y="8" textAnchor="middle">msgs 1–4</text>
        </g>
        <text x="172" y="34" textAnchor="middle" className={"ifl-ann" + (stage === 4 || stage === 5 ? " on" : "")}>4 messages → 1 summary</text>

        {msgs.map((m) => (
          <g key={m.i} className={"cf-msg " + m.role + (m.gone ? " gone" : "")}
             style={{ transform: `translate(${m.cx}px, ${CY}px) scale(${m.on ? m.scale : 0.4})`, opacity: m.gone ? 0 : (m.on ? 1 : 0) }}>
            <rect x={-MW / 2} y="-18" width={MW} height="36" />
            <text className="cf-role" x="0" y="-5" textAnchor="middle">{m.role}</text>
            <text className="cf-msglbl" x="0" y="7" textAnchor="middle">msg {m.i + 1}</text>
          </g>
        ))}

        {/* usage gauge */}
        <rect className="cf-gaugebg" x="18" y="106" width="304" height="5" />
        <rect className={"cf-gauge" + (nearlyFull ? " warn" : "")} x="18" y="106" height="5" width={GW} />
        <text className="cf-pct" x="322" y="122" textAnchor="end">{pct}% full</text>
      </svg>
      <FlowCtrl playing={playing} setPlaying={setPlaying}
        onRestart={() => { setStage(0); setPlaying(true); }}
        step={stage} total={N} />
    </div>
  );
}

function LessonBlock({ block, idHint }) {
  switch (block.t) {
    case "h":
      return <h4 className="lesson-h">{block.text}</h4>;
    case "callout":
      return (
        <div className={"lesson-callout " + (block.kind || "tip")}>
          {block.title && <div className="lesson-callout-title">{block.title}</div>}
          <div dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      );
    case "code":
      return (
        <div className="lesson-code">
          {block.label && <div className="lesson-code-bar">{block.label}</div>}
          <pre><code>{block.code}</code></pre>
        </div>
      );
    case "diagram":
      return <div className="lesson-diagram"><Diagram text={block.mermaid} idHint={idHint} /></div>;
    case "compare": {
      const Col = ({ data, tone, mark }) => (
        <div className={"lesson-cmp-col " + tone}>
          <div className="lesson-cmp-tag">{data.tag}</div>
          {data.context && (
            <div className="lesson-cmp-ctx">
              <span className="lesson-cmp-ctxlabel">retrieved context</span>{data.context}
            </div>
          )}
          <div className="lesson-cmp-answer">{data.answer}</div>
          <div className="lesson-cmp-verdict">{mark} {data.verdict}</div>
          {data.note && <div className="lesson-cmp-note">{data.note}</div>}
        </div>
      );
      return (
        <div className="lesson-compare">
          <div className="lesson-cmp-q"><span className="lesson-cmp-qlabel">question</span>{block.question}</div>
          <div className="lesson-cmp-grid">
            <Col data={block.left} tone="bad" mark="✗" />
            <Col data={block.right} tone="good" mark="✓" />
          </div>
        </div>
      );
    }
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag className="lesson-list">
          {block.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}
        </Tag>
      );
    }
    case "steps":
      return (
        <ol className="steps lesson-steps">
          {block.items.map((it, i) => (
            <li key={i}>
              <span className="step-n">{String(i + 1).padStart(2, "0")}</span>
              <span dangerouslySetInnerHTML={{ __html: it }} />
            </li>
          ))}
        </ol>
      );
    case "predict": {
      const max = Math.max(...block.candidates.map((c) => c.p));
      return (
        <div className="lesson-predict">
          {block.label && <div className="lesson-predict-label">{block.label}</div>}
          <div className="lesson-predict-text">{block.prefix}<span className="lesson-predict-caret">▮</span></div>
          <div className="lesson-predict-bars">
            {block.candidates.map((c, i) => (
              <div className={"lesson-predict-row" + (i === 0 ? " top" : "")} key={i}>
                <span className="lesson-predict-tok">{c.tok}</span>
                <span className="lesson-predict-bar"><span className="lesson-predict-fill" style={{ width: (c.p / max * 100) + "%" }} /></span>
                <span className="lesson-predict-p">{Math.round(c.p * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "loop":
      return (
        <div className="lesson-loop">
          {block.steps.map((s, i) => (
            <div className="lesson-loop-step" key={i}>
              <span className="lesson-loop-n">{i + 1}</span>
              <span className="lesson-loop-text">{s.prev}<span className="lesson-loop-new">{s.add}</span></span>
            </div>
          ))}
        </div>
      );
    case "pipeline":
      return (
        <div className="pipeline">
          {block.stages.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="pipe-arrow" aria-hidden="true">→</span>}
              <div className="pipe-stage">
                <span className="pipe-label">{s.label}</span>
                <div className={"pipe-box" + (s.kind ? " " + s.kind : "")}>{s.value}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      );
    case "genloop":
      return <GenLoop steps={block.steps} prompt={block.prompt} />;
    case "assist":
      return <AssistBlock block={block} />;
    case "recap":
      return (
        <div className="recap">
          <div className="recap-head"><i className="ph-duotone ph-seal-check recap-icon" aria-hidden="true" />What you should know now</div>
          <ul>{block.items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}</ul>
        </div>
      );
    case "quiz":
      return <Quiz items={block.items} />;
    case "vectorspace":
      return <VectorSpace points={block.points} query={block.query} />;
    case "ingestflow":
      return <IngestFlow doc={block.doc} chunkCount={block.chunkCount} />;
    case "queryflow":
      return <QueryFlow question={block.question} nearestLabel={block.nearestLabel} chunkPreview={block.chunkPreview} answer={block.answer} />;
    case "agentloopflow":
      return <AgentLoopFlow question={block.question} toolName={block.toolName} toolCall={block.toolCall} toolResult={block.toolResult} finalAnswer={block.finalAnswer} />;
    case "evalflow":
      return <EvalFlow />;
    case "traceflow":
      return <TraceFlow />;
    case "gateflow":
      return <GateFlow />;
    case "compactflow":
      return <CompactFlow />;
    case "tryit":
      return (
        <div className="tryit">
          <div className="tryit-head"><i className="ph-duotone ph-cursor-click tryit-icon" aria-hidden="true" />Try it yourself — 30 seconds</div>
          {block.steps.map((s, i) => (
            <div className="tryit-step" key={i}>
              {s.say && <div className="tryit-say" dangerouslySetInnerHTML={{ __html: s.say }} />}
              <div className="tryit-prompt">{s.prompt}</div>
              {s.then && <div className="tryit-then" dangerouslySetInnerHTML={{ __html: s.then }} />}
            </div>
          ))}
        </div>
      );
    default:
      return <p className="lesson-p" dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
}

function LessonModal({ phase, lessons, initialSub, onNav, onClose }) {
  const [active, setActive] = useState(() =>
    Math.max(0, lessons.findIndex((l) => l.id === initialSub)));
  const ref = useRef(null);
  const contentRef = useRef(null);
  const num = String(phase.n).padStart(2, "0");
  const total = lessons.length;
  const lesson = lessons[active];
  const go = (i) => {
    const next = Math.max(0, Math.min(total - 1, i));
    setActive(next);
    if (onNav) onNav(lessons[next].id);
  };

  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  useEffect(() => { if (contentRef.current) contentRef.current.scrollTo(0, 0); }, [active]);

  return (
    <div className="lesson-overlay" onClick={onClose}>
      <div className="lesson-modal" role="dialog" aria-modal="true" tabIndex={-1} ref={ref}
           data-phase={phase.n} onClick={(e) => e.stopPropagation()}>
        <header className="lesson-top">
          <div className="lesson-top-id">
            <span className="lesson-top-num">{num}</span>
            <h2 className="lesson-top-title">{phase.title}</h2>
            <span className="lesson-top-kicker">{phase.kicker}</span>
          </div>
          <button className="close lesson-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="lesson-body">
          <nav className="lesson-nav" aria-label="Subtopics">
            <div className="lesson-nav-label">// in this phase</div>
            <ol>
              {lessons.map((l, i) => (
                <li key={l.id}>
                  <button
                    className={"lesson-nav-item" + (i === active ? " active" : "")}
                    onClick={() => go(i)}
                    aria-current={i === active ? "page" : undefined}>
                    <span className="lesson-nav-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="lesson-nav-text">{l.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <main className="lesson-content" ref={contentRef}>
            <article className="lesson-page">
              <div className="lesson-page-eyebrow">{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
              <h3 className="lesson-page-title">{lesson.label}</h3>
              {lesson.blocks.map((b, i) => (
                <LessonBlock key={i} block={b} idHint={`p${phase.n}-l${active}-b${i}`} />
              ))}
              <div className="lesson-pager">
                <button className="lesson-pager-btn" disabled={active === 0} onClick={() => go(active - 1)}>
                  <span className="lesson-pager-arrow">←</span>
                  <span>Previous</span>
                </button>
                <button className="lesson-pager-btn" disabled={active === total - 1} onClick={() => go(active + 1)}>
                  <span>Next</span>
                  <span className="lesson-pager-arrow">→</span>
                </button>
              </div>
              <p className="lp-disclaimer">Views here are my own. They do not represent my employer, and nothing I write is affiliated with or endorsed by them.</p>
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}

/* ============================ Footer tips ============================ */
/* ============================ Ask a question modal ============================ */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwvznrpv";

function QuestionModal({ onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [state, setState] = useState("idle");

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !question.trim() || state === "sending" || state === "done") return;
    setState("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, message: question, source: "lp-genai-question" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  const locked = state === "sending" || state === "done";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" tabIndex={-1} ref={ref}
           onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <div className="howto-head">
          <div className="m-kicker">// ASK</div>
          <h2 className="m-title">Have a question?</h2>
        </div>
        <p className="howto-lede">
          Stuck on a phase, want more depth on a topic, or have a suggestion? Drop a note — I read every one.
        </p>
        {state === "done" ? (
          <p className="qform-done">Got it — thanks. I'll reply over email.</p>
        ) : (
          <form className="qform" onSubmit={submit}>
            <label className="qform-label">
              <span>Your email</span>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
                disabled={locked}
              />
            </label>
            <label className="qform-label">
              <span>Your question</span>
              <textarea
                placeholder="What would you like to know?"
                rows={4}
                required
                value={question}
                onChange={(e) => { setQuestion(e.target.value); if (state === "error") setState("idle"); }}
                disabled={locked}
              />
            </label>
            <button type="submit" disabled={locked || !email || !question.trim()}>
              {state === "sending" ? "Sending…" : state === "error" ? "Try again" : "Send"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================ Subscribe band ============================ */
// Same Formspree inbox as the blog's sidebar widget; `source` tells them apart.
function SubscribeBand() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle");
  const submit = async (e) => {
    e.preventDefault();
    if (!email || state === "sending" || state === "done") return;
    setState("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, source: "lp-genai-subscribe" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };
  return (
    <section className="sub-band" id="subscribe" aria-label="Subscribe for updates">
      <div className="sub-band-text">
        <div className="sub-band-label">// stay in the loop</div>
        <h3 className="sub-band-h">Get updates by email</h3>
        <p className="sub-band-p">
          New phases, interactive walkthroughs, and the occasional essay from In Context.
          One short email when something new ships — nothing else.
        </p>
      </div>
      <div className="sub-band-side">
        {state === "done" ? (
          <p className="sub-band-done">✓ You're on the list — see you in your inbox.</p>
        ) : (
          <form className="sub-band-form" onSubmit={submit}>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
              disabled={state === "sending"}
            />
            <button type="submit" disabled={state === "sending"}>
              {state === "sending" ? "Sending…" : state === "error" ? "Try again" : "Subscribe →"}
            </button>
          </form>
        )}
        <p className="sub-band-note">No spam, no tracking, one-click unsubscribe.</p>
      </div>
    </section>
  );
}

/* ============================ Where to go next ============================ */
function NextSteps() {
  return (
    <section className="next">
      <div className="next-label">## where to go next</div>
      <p className="next-intro">
        You've shipped the 11 phases. Here's what matters next — in order, from this week to months from now.
      </p>
      <div className="next-sections">
        {window.NEXT_STEPS.map((s) => (
          <article className="next-sec" key={s.n}>
            <header className="next-sec-head">
              <span className="next-when">{String(s.n).padStart(2, "0")} · {s.when}</span>
              <h3 className="next-h">{s.title}</h3>
              <p className="next-sec-lede">{s.lede}</p>
            </header>
            <ul className="next-items">
              {s.items.map((it, i) => (
                <li key={i}>
                  <span className="next-item-bullet">→</span>
                  <span className="next-item-body">
                    <strong className="next-item-t">{it.t}</strong>
                    <span className="next-item-sep"> — </span>
                    <span className="next-item-d">{it.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function HowToModal({ onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal modal-sm" role="dialog" aria-modal="true" tabIndex={-1} ref={ref}
           onClick={(e) => e.stopPropagation()}>
        <button className="close" onClick={onClose} aria-label="Close">×</button>
        <div className="howto-head">
          <div className="m-kicker">// GUIDE</div>
          <h2 className="m-title">How to use this plan</h2>
        </div>
        <p className="howto-lede">A few rules that compound. Skim them once before you start the phases.</p>
        <div className="howto-tips">
          {window.PLAN_TIPS.map((t, i) => (
            <div className="tip" key={i}>
              <div className="tip-k"><span className="tip-bullet">—</span>{t.k}</div>
              <div className="tip-v">{t.v}</div>
            </div>
          ))}
        </div>
        <a className="howto-setup" href="https://code.claude.com/docs/en/quickstart"
           target="_blank" rel="noopener noreferrer">
          <i className="ph-duotone ph-rocket-launch" aria-hidden="true" />
          <span><strong>New here?</strong> Set up Claude Code (or the Desktop app — no terminal needed). You won't be writing code by hand. <span className="howto-setup-arrow">Get started ↗</span></span>
        </a>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
