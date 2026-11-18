const { useState, useEffect, useMemo, useRef } = React;

const CATEGORIES = ["All", "Thoughts", "Agentic AI and Tools", "Safety", "Personal"];

// Giscus — GitHub-backed comments + reactions.
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

function PostLink({ post, onOpen, className, children }) {
  return (
    <a className={className} href={hrefFor(post.id)}
       onClick={(e) => { if (navClick(e)) { e.preventDefault(); onOpen(post.id); } }}>
      {children}
    </a>
  );
}

function ThemeGlyph({ theme }) {
  if (theme === "ink") {
    return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="5" fill="currentColor" /><circle cx="8" cy="5" r="3" fill="var(--bg)" /></svg>;
  }
  return <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>;
}

// Two themes per look: a light one ("paper") and a dark one ("ink").
function ThemeToggle({ theme, setTheme }) {
  const next = theme === "ink" ? "paper" : "ink";
  const label = theme === "ink" ? "Dark" : "Light";
  return (
    <button className="theme-btn" onClick={() => setTheme(next)} title="Switch theme" aria-label={`Theme: ${label}`}>
      <ThemeGlyph theme={theme} />
      <span className="theme-label">{label}</span>
    </button>
  );
}

function LearningLink() {
  return (
    <a className="lp-link" href="/learning/genai" title="A 12-phase, build-as-you-learn roadmap">
      <span className="lp-full">GenAI Learning Path</span><span className="lp-compact">Learning Path</span> →
    </a>
  );
}

function useCounts(posts) {
  return useMemo(() => {
    const c = { All: posts.length };
    posts.forEach(p => { c[p.category] = (c[p.category] || 0) + 1; });
    return c;
  }, [posts]);
}

const DISCLAIMER = "Views here are my own. They do not represent my employer, and nothing I write is affiliated with or endorsed by them.";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xwvznrpv";

function useSubscribe() {
  const [val, setVal] = useState("");
  const [state, setState] = useState("idle");
  const labels = { idle: "Subscribe", sending: "Sending…", error: "Try again" };
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
  const onChange = (e) => { setVal(e.target.value); if (state === "error") setState("idle"); };
  return { val, state, label: labels[state], submit, onChange };
}

function SubscribeForm() {
  const s = useSubscribe();
  return (
    <React.Fragment>
      {s.state === "done" ? (
        <p className="sub-done">✓ You're on the list — see you in your inbox.</p>
      ) : (
        <form className="subscribe" onSubmit={s.submit}>
          <input type="email" placeholder="you@example.com" required value={s.val}
                 onChange={s.onChange} disabled={s.state === "sending"} aria-label="Email address" />
          <button type="submit" disabled={s.state === "sending"}>{s.label} →</button>
        </form>
      )}
      {s.state === "error" && <p className="sub-error">Something went wrong — mind trying once more?</p>}
      <p className="sub-note">No spam, no tracking, one-click unsubscribe.</p>
    </React.Fragment>
  );
}

function Giscus({ postId, theme }) {
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
      "data-theme": document.documentElement.getAttribute("data-theme") === "ink" ? "dark" : "light",
      "data-lang": "en",
      "data-loading": "lazy",
    };
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
    ref.current.appendChild(s);
  }, [postId, theme]);
  if (GISCUS_CONFIG.repoId.startsWith("REPLACE_")) return null;
  return <div ref={ref} className="giscus-container" />;
}

function Block({ block, index }) {
  if (block.type === "h2") return <h2 id={"s" + index} dangerouslySetInnerHTML={{ __html: block.html }} />;
  if (block.type === "pull") return <blockquote className="pull" dangerouslySetInnerHTML={{ __html: '“' + block.html + '”' }} />;
  if (block.type === "code") return <pre className="code"><code dangerouslySetInnerHTML={{ __html: block.html }} /></pre>;
  if (block.type === "list") {
    const Tag = block.ordered ? "ol" : "ul";
    return <Tag>{block.items.map((html, i) => <li key={i} dangerouslySetInnerHTML={{ __html: html }} />)}</Tag>;
  }
  return <p dangerouslySetInnerHTML={{ __html: block.html }} />;
}

function Prose({ post }) {
  return (
    <div className="prose">
      {post.body.map((b, i) => <Block key={i} block={b} index={i} />)}
    </div>
  );
}

function stripTags(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || "";
}

// Shared app shell: state, URL sync, theme. Each look supplies Home + Post + chrome.
function useBlogState(defaultTheme) {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || defaultTheme);
  const [active, setActive] = useState("All");
  const [openId, setOpenId] = useState(() => idFromPath());

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const posts = window.POSTS || [];
  const filtered = active === "All" ? posts : posts.filter(p => p.category === active);
  const openPost = openId ? posts.find(p => p.id === openId) : null;

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

  useEffect(() => {
    if (openId && !openPost && posts.length > 0) setOpenId(null);
  }, [openId, openPost, posts.length]);

  useEffect(() => { window.scrollTo(0, 0); }, [openId]);

  return { theme, setTheme, active, setActive, openId, setOpenId, posts, filtered, openPost };
}

/* ───────── Look B · Signal — bold, modern, technical ───────── */

const pad = (n) => String(n).padStart(2, "0");

function TopBar({ onHome, theme, setTheme, posts }) {
  const latest = posts[0];
  return (
    <header className="topbar">
      <div className="bar">
        <a href="/" className="logo" onClick={(e) => { if (navClick(e)) { e.preventDefault(); onHome(); } }}>
          <span className="logo-mark" aria-hidden="true"></span>
          <span className="logo-text">in_context</span>
          <span className="logo-sub">/ aravind singirikonda</span>
        </a>
        <div className="bar-actions">
          <LearningLink />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className="ticker mono">
        <span><b>{pad(posts.length)}</b> essays</span>
        {latest && <span>last update <b>{latest.date}</b></span>}
        <span className="hide-sm">Cumming, GA · 34.21° N</span>
      </div>
    </header>
  );
}

function Filters({ active, setActive, posts }) {
  const counts = useCounts(posts);
  return (
    <div className="filters mono" role="tablist">
      {CATEGORIES.map(cat => (
        <button key={cat} role="tab" aria-selected={active === cat}
                className={"filter" + (active === cat ? " active" : "")} onClick={() => setActive(cat)}>
          {cat}<span className="n">{pad(counts[cat] || 0)}</span>
        </button>
      ))}
    </div>
  );
}

function IndexRow({ post, n, onOpen }) {
  return (
    <PostLink post={post} onOpen={onOpen} className="irow">
      <span className="i-n mono">{pad(n)}</span>
      <span className="i-main">
        <span className="i-title">{post.title}</span>
        <span className="i-excerpt">{post.excerpt}</span>
      </span>
      <span className="i-cat mono">[{post.category}]</span>
      <span className="i-meta mono">{post.date}<br />{post.readTime}</span>
      <span className="i-arrow" aria-hidden="true">↗</span>
    </PostLink>
  );
}

function Panels({ posts, onOpen }) {
  return (
    <section className="panels">
      <div className="panel">
        <div className="panel-h mono">// author</div>
        <h3>Aravind Singirikonda</h3>
        <a className="panel-link mono" href="https://www.linkedin.com/in/aravindsingirikonda" target="_blank" rel="noopener">linkedin /in/aravindsingirikonda ↗</a>
        <p className="disclaimer">{DISCLAIMER}</p>
      </div>
      <div className="panel panel-accent">
        <div className="panel-h mono">// newsletter</div>
        <h3>Get new notes by email</h3>
        <p>One short essay every other week — what I'm building, what I'm worried about, and what AI doesn't quite reach.</p>
        <SubscribeForm />
      </div>
      <div className="panel">
        <div className="panel-h mono">// most read this month</div>
        <ol className="mini">
          {posts.slice(0, 4).map((p, i) => (
            <li key={p.id}><PostLink post={p} onOpen={onOpen}><span className="mono">{pad(i + 1)}</span>{p.title}</PostLink></li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Home({ s }) {
  return (
    <main>
      <section className="hero">
        <div className="eyebrow mono">In Context · Vol. 1</div>
        <h1>Half-formed thoughts on AI, work, and <em>being a person</em> while it all changes.</h1>
        <p className="lede">This is where I write about what I'm building, what I'm worried about, and what AI doesn't quite reach.</p>
      </section>
      <Filters active={s.active} setActive={s.setActive} posts={s.posts} />
      <div className="index">
        {s.filtered.length === 0
          ? <p className="empty mono">// nothing in this category yet — check back soon.</p>
          : s.filtered.map((p, i) => <IndexRow key={p.id} post={p} n={i + 1} onOpen={s.setOpenId} />)}
      </div>
      <Panels posts={s.posts} onOpen={s.setOpenId} />
    </main>
  );
}

function useProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setPct(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return pct;
}

function Post({ s }) {
  const post = s.openPost;
  const pct = useProgress();
  const toc = post.body.map((b, i) => ({ b, i })).filter(x => x.b.type === "h2");
  return (
    <main className="post">
      <div className="progress" style={{ width: pct + "%" }} aria-hidden="true"></div>
      <header className="post-head">
        <a className="back mono" href="/" onClick={(e) => { if (navClick(e)) { e.preventDefault(); s.setOpenId(null); } }}>← cd ../writing</a>
        <div className="post-cat mono">[{post.category}]</div>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta mono">
          <span>{post.date}</span><span>{post.readTime} read</span><span>by Aravind Singirikonda</span>
        </div>
      </header>
      <div className="post-grid">
        <aside className="rail">
          {toc.length > 0 && (
            <nav className="toc">
              <div className="panel-h mono">// contents</div>
              <ol>
                {toc.map((x, k) => <li key={x.i}><a href={"#s" + x.i}><span className="mono">{pad(k + 1)}</span>{stripTags(x.b.html)}</a></li>)}
              </ol>
            </nav>
          )}
          <LikeButton id={post.id} />
        </aside>
        <article className="post-body">
          <p className="disclaimer">{DISCLAIMER}</p>
          {post.banner && (
            <figure className="post-banner"><img src={post.banner} alt={post.bannerAlt || post.title} loading="eager" /></figure>
          )}
          <Prose post={post} />
          <div className="endmark mono"><span className="blk"></span>EOF — Thanks for reading. Reply by email if something landed.</div>
          <Giscus postId={post.id} theme={s.theme} />
        </article>
      </div>
      <Panels posts={s.posts.filter(p => p.id !== post.id)} onOpen={s.setOpenId} />
    </main>
  );
}

function Footer() {
  return (
    <footer className="foot mono">
      <div>© 2026 Aravind Singirikonda · Opinions here are mine alone.</div>
      <div>Set in Inter Tight + JetBrains Mono · Built by hand</div>
    </footer>
  );
}

function App() {
  const s = useBlogState("ink");
  return (
    <div className="shell">
      <TopBar onHome={() => s.setOpenId(null)} theme={s.theme} setTheme={s.setTheme} posts={s.posts} />
      {s.openPost ? <Post s={s} /> : <Home s={s} />}
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
