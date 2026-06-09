const { useState, useEffect, useMemo, useRef } = React;

const CATEGORIES = ["All", "Thoughts", "Agentic AI and Tools", "Safety", "Personal"];

// Giscus — GitHub-backed comments + reactions.
// Setup (one-time, ~5 minutes):
//   1. Create a public GitHub repo (or use the in-context repo itself).
//   2. In repo Settings → Features, enable Discussions.
//   3. Install the giscus app on the repo: https://github.com/apps/giscus
//   4. Go to https://giscus.app, fill in the form (Mapping = "pathname",
//      Reactions = enabled), and copy the four values below from the
//      generated <script> tag.
// Until repoId is set to a real value, the comments block is hidden.
const GISCUS_CONFIG = {
  repo: "aravs16/in-context",
  repoId: "R_kgDOSo7DeQ",
  category: "General",
  categoryId: "DIC_kwDOSo7Dec4C97EG",
};

function idFromPath() {
  const m = window.location.pathname.match(/^\/p\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

function hrefFor(id) {
  return id ? `/p/${id}` : '/';
}

function navClick(e) {
  return !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1);
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "paper",
  "accent": "#B85A3C",
  "showSubscribe": true,
  "showRecent": true,
  "titleFont": "grotesk",
  "rowHover": "shift"
}/*EDITMODE-END*/;

function Brand() {
  return (
    <div className="brand">
      <span className="dot"></span>
      <span>in context</span>
      <span className="sub">— by Aravind Singirikonda</span>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }) {
  const order = ["paper", "sage", "ink"];
  const labels = { paper: "Paper", sage: "Sage", ink: "Ink" };
  const next = () => setTheme(order[(order.indexOf(theme) + 1) % order.length]);
  return (
    <button className="theme-btn" onClick={next} title="Cycle theme" aria-label={`Theme: ${labels[theme]}`}>
      <ThemeGlyph theme={theme} />
      <span className="theme-label">{labels[theme]}</span>
    </button>
  );
}

function ThemeGlyph({ theme }) {
  if (theme === "ink") {
    return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="currentColor" /><circle cx="8" cy="5" r="3" fill="var(--bg-elev)" /></svg>;
  }
  if (theme === "sage") {
    return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M3.5 7 Q6 4 8.5 7" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
  }
  return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

function TopNav({ onHome, theme, setTheme }) {
  return (
    <nav className="topnav">
      <a href="/" style={{cursor:"pointer"}}
         onClick={(e) => { if (navClick(e)) { e.preventDefault(); onHome(); } }}>
        <Brand />
      </a>
      <div className="navlinks">
        <a className="lp-link" href="/learning/genai" title="A 12-phase, build-as-you-learn roadmap">
          <span className="lp-full">GenAI Learning Path</span><span className="lp-compact">Learning Path</span> →
        </a>
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
    </nav>
  );
}

function Intro() {
  return (
    <div className="intro">
      <div className="eyebrow">In Context · Vol. 1</div>
      <h1>
        Half-formed thoughts on AI, work, and <em>being a person</em> while it all changes.
      </h1>
      <p className="lede">
        I'm a Sr. Worldwide Specialist Solutions Architect at AWS focused on agentic AI. This is where I write about what I'm building, what I'm worried about, and what AI doesn't quite reach.
      </p>
    </div>
  );
}

function Categories({ active, setActive, posts }) {
  const counts = useMemo(() => {
    const c = { All: posts.length };
    posts.forEach(p => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [posts]);
  return (
    <div className="cats">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={"cat" + (active === cat ? " active" : "")}
          onClick={() => setActive(cat)}
        >
          {cat}<span className="count">{counts[cat] || 0}</span>
        </button>
      ))}
    </div>
  );
}

function PostRow({ post, onOpen }) {
  return (
    <a className="post-row" href={hrefFor(post.id)}
       onClick={(e) => { if (navClick(e)) { e.preventDefault(); onOpen(post.id); } }}>
      <div className="post-meta mono">
        <span className="date">{post.date}</span>
        <span className="read">{post.readTime} read</span>
      </div>
      <div>
        <h2 className="post-title">{post.title}</h2>
        <p className="post-excerpt">{post.excerpt}</p>
      </div>
      <span className="post-tag">{post.category}</span>
    </a>
  );
}

function PostList({ posts, onOpen }) {
  if (posts.length === 0) {
    return <div style={{padding: "60px 0", color: "var(--ink-mute)", fontSize: 14}}>Nothing in this category yet — check back soon.</div>;
  }
  return (
    <div className="posts">
      {posts.map(p => <PostRow key={p.id} post={p} onOpen={onOpen} />)}
    </div>
  );
}

function ProfileCard() {
  return (
    <div className="profile">
      <h3 className="name">Aravind Singirikonda</h3>
      <p className="role">Sr. WW Specialist SA, GenAI · AWS</p>
      <p className="bio">
        I help enterprise teams move agentic AI from demo to production. Writing here is mine, not my employer's — half-formed thoughts that earn somewhere better to go.
      </p>
      <div className="links">
        <div className="link-row"><span className="label">LinkedIn</span><span className="val">/in/aravindsingirikonda</span></div>
        <div className="link-row"><span className="label">GitHub</span><span className="val">@aravs16</span></div>
        <div className="link-row"><span className="label">Work</span><span className="val">Amazon Web Services</span></div>
        <div className="link-row"><span className="label">RSS</span><span className="val">/feed.xml</span></div>
      </div>
      <div className="status">
        <span className="pulse"></span>
        <span>Currently — drafting on agent eval harnesses</span>
      </div>
    </div>
  );
}

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwvznrpv";

function Subscribe() {
  const [val, setVal] = useState("");
  const [state, setState] = useState("idle");
  const labels = { idle: "Subscribe", sending: "…", done: "✓ Sent", error: "Try again" };
  const submit = async (e) => {
    e.preventDefault();
    if (!val || state === "sending" || state === "done") return;
    setState("sending");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: val, source: "in-context-sidebar" }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };
  const locked = state === "sending" || state === "done";
  return (
    <div className="side-widget">
      <h4>Get new notes by email</h4>
      <p>One short essay every other week. No tracking, easy to unsubscribe, never anything else.</p>
      <form className="subscribe" onSubmit={submit}>
        <input type="email" placeholder="you@example.com" required value={val}
               onChange={e => { setVal(e.target.value); if (state === "error") setState("idle"); }}
               disabled={locked} />
        <button type="submit" className={state === "done" ? "done" : ""} disabled={state === "sending"}>
          {labels[state]}
        </button>
      </form>
    </div>
  );
}

function SideRecent({ posts, onOpen }) {
  const top = posts.slice(0, 4);
  if (top.length === 0) return null;
  return (
    <div className="side-recent">
      <h4>Most read this month</h4>
      <ul>
        {top.map((p, i) => (
          <li key={p.id}>
            <a href={hrefFor(p.id)}
               onClick={(e) => { if (navClick(e)) { e.preventDefault(); onOpen(p.id); } }}>
              <span className="n mono">0{i + 1}</span>{p.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Sidebar({ posts, onOpen, showSubscribe = true, showRecent = true }) {
  return (
    <aside className="sidebar">
      <ProfileCard />
      {showSubscribe && <Subscribe />}
      {showRecent && <SideRecent posts={posts} onOpen={onOpen} />}
    </aside>
  );
}

function Giscus({ postId }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    if (GISCUS_CONFIG.repoId.startsWith("REPLACE_")) return;
    ref.current.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    const attrs = {
      "data-repo": GISCUS_CONFIG.repo,
      "data-repo-id": GISCUS_CONFIG.repoId,
      "data-category": GISCUS_CONFIG.category,
      "data-category-id": GISCUS_CONFIG.categoryId,
      "data-mapping": "pathname",
      "data-strict": "0",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "bottom",
      "data-theme": "light",
      "data-lang": "en",
      "data-loading": "lazy",
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    ref.current.appendChild(s);
  }, [postId]);
  if (GISCUS_CONFIG.repoId.startsWith("REPLACE_")) return null;
  return <div ref={ref} className="giscus-container" />;
}

function Block({ block }) {
  if (block.type === "h2") return <h2 dangerouslySetInnerHTML={{ __html: block.html }} />;
  if (block.type === "pull") return <div className="pull" dangerouslySetInnerHTML={{ __html: '\u201C' + block.html + '\u201D' }} />;
  if (block.type === "code") return <pre className="code"><code dangerouslySetInnerHTML={{ __html: block.html }} /></pre>;
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return <Tag>{block.items.map((html, i) => <li key={i} dangerouslySetInnerHTML={{ __html: html }} />)}</Tag>;
  }
  return <p dangerouslySetInnerHTML={{ __html: block.html }} />;
}

function PostDetail({ post, onBack, allPosts, onOpen, sidebarProps = {} }) {
  useEffect(() => { window.scrollTo(0, 0); }, [post.id]);
  return (
    <div className="grid">
      <div className="detail">
        <a className="back" href="/"
           onClick={(e) => { if (navClick(e)) { e.preventDefault(); onBack(); } }}>
          <svg viewBox="0 0 16 16" fill="none"><path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          All writing
        </a>
        <span className="post-tag">{post.category}</span>
        <h1 className="post-h">{post.title}</h1>
        <div className="post-meta-row mono">
          <span>{post.date}</span>
          <span className="sep">·</span>
          <span>{post.readTime} read</span>
          <span className="sep">·</span>
          <span>By Aravind Singirikonda</span>
        </div>
        {post.banner && (
          <figure className="post-banner">
            <img src={post.banner} alt={post.bannerAlt || post.title} loading="eager" />
          </figure>
        )}
        <div className="prose">
          {post.body.map((b, i) => <Block key={i} block={b} />)}
        </div>
        <div className="endmark">
          <span className="glyph"></span>
          <span>Thanks for reading. Reply by email if something landed.</span>
        </div>
        <Giscus postId={post.id} />
      </div>
      <Sidebar posts={allPosts.filter(p => p.id !== post.id)} onOpen={onOpen} {...sidebarProps} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div className="colophon">
        <div>© 2026 Aravind Singirikonda · Opinions here are mine alone.</div>
        <div style={{marginTop: 6}}>Set in Space Grotesk. Built by hand. No analytics.</div>
      </div>
      <div className="mono" style={{textAlign: "right"}}>
        <div>v1.0 · Updated May 2026</div>
        <div style={{marginTop: 6}}>Cumming, GA · 34.21° N</div>
      </div>
    </footer>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [active, setActive] = useState("All");
  const [openId, setOpenId] = useState(() => idFromPath());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", t.theme);
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.setAttribute("data-title-font", t.titleFont);
    document.documentElement.setAttribute("data-row-hover", t.rowHover);
  }, [t.theme, t.accent, t.titleFont, t.rowHover]);

  const posts = window.POSTS || [];
  const filtered = active === "All" ? posts : posts.filter(p => p.category === active);
  const openPost = openId ? posts.find(p => p.id === openId) : null;

  // URL ↔ state sync
  useEffect(() => {
    const expected = hrefFor(openPost ? openId : null);
    if (window.location.pathname !== expected) {
      window.history.pushState({ openId: openPost ? openId : null }, '', expected);
    }
    document.title = openPost
      ? `${openPost.title} — In Context`
      : 'In Context — Aravind Singirikonda';
  }, [openId, openPost]);

  useEffect(() => {
    const onPop = () => setOpenId(idFromPath());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // If URL points to an unknown post, drop back to home
  useEffect(() => {
    if (openId && !openPost && posts.length > 0) setOpenId(null);
  }, [openId, openPost, posts.length]);

  const sidebarProps = { showSubscribe: t.showSubscribe, showRecent: t.showRecent };

  return (
    <div className="shell">
      <TopNav onHome={() => setOpenId(null)} theme={t.theme} setTheme={(v) => setTweak('theme', v)} />
      {openPost ? (
        <PostDetail post={openPost} onBack={() => setOpenId(null)} allPosts={posts} onOpen={setOpenId} sidebarProps={sidebarProps} />
      ) : (
        <React.Fragment>
          <Intro />
          <div className="grid">
            <div>
              <Categories active={active} setActive={setActive} posts={posts} />
              <PostList posts={filtered} onOpen={setOpenId} />
            </div>
            <Sidebar posts={posts} onOpen={setOpenId} {...sidebarProps} />
          </div>
        </React.Fragment>
      )}
      <Footer />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Mode" value={t.theme}
          options={["paper", "sage", "ink"]}
          onChange={(v) => setTweak('theme', v)} />
        <TweakColor label="Accent" value={t.accent}
          options={["#B85A3C", "#4F7A4F", "#3B6BB0", "#8A5DA8"]}
          onChange={(v) => setTweak('accent', v)} />

        <TweakSection label="Layout" />
        <TweakSelect label="Title font" value={t.titleFont}
          options={[
            { value: "grotesk", label: "Space Grotesk (sans)" },
            { value: "inter-tight", label: "Inter Tight (sans)" },
            { value: "fraunces", label: "Fraunces (serif)" },
            { value: "instrument", label: "Instrument Serif" }
          ]}
          onChange={(v) => setTweak('titleFont', v)} />
        <TweakRadio label="Row hover" value={t.rowHover}
          options={["shift", "tint", "none"]}
          onChange={(v) => setTweak('rowHover', v)} />

        <TweakSection label="Sidebar" />
        <TweakToggle label="Subscribe widget" value={t.showSubscribe}
          onChange={(v) => setTweak('showSubscribe', v)} />
        <TweakToggle label="Most-read list" value={t.showRecent}
          onChange={(v) => setTweak('showRecent', v)} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
