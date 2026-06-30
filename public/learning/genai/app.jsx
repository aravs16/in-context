/* GenAI Learning Path — interactive timeline with grid + vertical views */
const { useState, useEffect, useLayoutEffect, useRef, useCallback } = React;

const COLS = 3;
const WIDE_AT = 940;
const VIEW_KEY = "genai-path-view";

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

  const [modal, setModal] = useState(null);
  const [howTo, setHowTo] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setModal(null); setHowTo(false); setAskOpen(false); } };
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
              onHowTo={() => setHowTo(true)}
              onAsk={() => setAskOpen(true)} />
      {view === "grid"
        ? <SerpentineBoard onOpen={setModal} />
        : <VerticalTimeline onOpen={setModal} />}
      <NextSteps />
      {modal !== null && (() => {
        const phase = window.PHASES[modal];
        const lessons = window.PHASE_LESSONS && window.PHASE_LESSONS[phase.n];
        return lessons && lessons.length
          ? <LessonModal phase={phase} lessons={lessons} onClose={() => setModal(null)} />
          : <Pane phase={phase} onClose={() => setModal(null)} />;
      })()}
      {howTo && <HowToModal onClose={() => setHowTo(false)} />}
      {askOpen && <QuestionModal onClose={() => setAskOpen(false)} />}
    </div>
  );
}

/* ============================ Header ============================ */
function Header({ view, setView, onHowTo, onAsk }) {
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
        </div>
      </div>

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
        A practical roadmap where every phase ships a working artifact and the next one extends
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

      <div className="hdr-rule" />

      <div className="stats-row">
        <span><span className="stat-num">12</span> phases</span>
        <span><span className="stat-num">1</span> running codebase</span>
        <span><span className="stat-arrow">↗</span> ships an artifact each step</span>
        <span className="hint">Hover for the gist · click for the full brief</span>
        <ViewToggle view={view} setView={setView} />
      </div>
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
    <div
      className={"card" + (peeking ? " peeking" : "")}
      data-phase={phase.n}
      style={style}
      ref={refCb}
      role="button"
      tabIndex={0}
      onMouseEnter={onPeek}
      onMouseLeave={onUnpeek}
      onFocus={onPeek}
      onBlur={onUnpeek}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
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
    </div>
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
              <div
                className="tl-card"
                data-phase={p.n}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(i); } }}
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
              </div>
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
function GenLoop({ steps }) {
  const N = steps.length;
  const [i, setI] = useState(0);            // tokens committed so far
  const [phase, setPhase] = useState("predict"); // predict | commit | done
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    let t;
    if (phase === "predict") {
      t = setTimeout(() => setPhase("commit"), 950);
    } else if (phase === "commit") {
      t = setTimeout(() => {
        if (i + 1 < N) { setI(i + 1); setPhase("predict"); }
        else { setPhase("done"); }
      }, 540);
    } else { // done — hold on the full sentence, then restart the loop
      t = setTimeout(() => { setI(0); setPhase("predict"); }, 2200);
    }
    return () => clearTimeout(t);
  }, [i, phase, playing, N]);

  const baseText = steps.slice(0, i).map((s) => s.add).join("");
  const justAdded = phase === "commit" ? steps[i].add : "";
  const cur = steps[Math.min(i, N - 1)];
  const max = Math.max(...cur.candidates.map((c) => c.p));

  return (
    <div className="genloop">
      <div className="genloop-screen">
        <span className="genloop-text">{baseText}{justAdded && <span className="genloop-new">{justAdded}</span>}</span>
        {phase !== "done" && <span className="genloop-caret">▮</span>}
      </div>
      <div className="genloop-pred">
        <div className="genloop-pred-label">
          {phase === "done" ? "● end-of-text predicted — generation stops" : "predicting next token…"}
        </div>
        {phase !== "done" && (
          <div className="genloop-bars">
            {cur.candidates.map((c, k) => (
              <div className={"genloop-row" + (k === 0 ? " chosen" : "") + (phase === "commit" && k === 0 ? " fire" : "")} key={k}>
                <span className="genloop-tok">{c.tok}</span>
                <span className="genloop-bar"><span className="genloop-fill" style={{ width: (c.p / max * 100) + "%" }} /></span>
                <span className="genloop-p">{Math.round(c.p * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="genloop-ctrl">
        <button className="genloop-btn" onClick={() => setPlaying((p) => !p)}>{playing ? "⏸ pause" : "▶ play"}</button>
        <button className="genloop-btn" onClick={() => { setI(0); setPhase("predict"); setPlaying(true); }}>↻ restart</button>
        <span className="genloop-step">token {phase === "done" ? N : Math.min(i + 1, N)} / {N}</span>
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
      return <GenLoop steps={block.steps} />;
    case "assist":
      return <AssistBlock block={block} />;
    default:
      return <p className="lesson-p" dangerouslySetInnerHTML={{ __html: block.html }} />;
  }
}

function LessonModal({ phase, lessons, onClose }) {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const contentRef = useRef(null);
  const num = String(phase.n).padStart(2, "0");
  const total = lessons.length;
  const lesson = lessons[active];
  const go = (i) => setActive(Math.max(0, Math.min(total - 1, i)));

  useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  useEffect(() => { if (contentRef.current) contentRef.current.scrollTo(0, 0); }, [active]);

  return (
    <div className="lesson-overlay" onClick={onClose}>
      <div className="lesson-modal" role="dialog" aria-modal="true" tabIndex={-1} ref={ref}
           data-phase={phase.n} onClick={(e) => e.stopPropagation()}>
        <header className="lesson-top">
          <div className="lesson-top-id">
            <span className="lesson-top-num">{num}</span>
            <div className="lesson-top-text">
              <div className="m-kicker">PHASE {num} · {phase.kicker}</div>
              <h2 className="lesson-top-title">{phase.title}</h2>
            </div>
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
