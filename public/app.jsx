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

/* ───────── Look A · Broadsheet — editorial, reading-first ───────── */

function Masthead({ onHome, theme, setTheme }) {
  return (
    <header className="masthead">
      <div className="mast-bar">
        <span className="mast-vol">In Context · Vol. 1</span>
        <div className="mast-actions">
          <LearningLink />
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <a href="/" className="wordmark"
         onClick={(e) => { if (navClick(e)) { e.preventDefault(); onHome(); } }}>
        In Context
      </a>
      <div className="mast-byline">by Aravind Singirikonda</div>
    </header>
  );
}

function CategoryTabs({ active, setActive, posts }) {
  const counts = useCounts(posts);
  return (
    <nav className="tabs" aria-label="Categories">
      {CATEGORIES.map(cat => (
        <button key={cat} className={"tab" + (active === cat ? " active" : "")} onClick={() => setActive(cat)}>
          {cat}<sup>{counts[cat] || 0}</sup>
        </button>
      ))}
    </nav>
  );
}

function Lead({ post, onOpen }) {
  return (
    <PostLink post={post} onOpen={onOpen} className="lead">
      <div className="kicker">Latest · {post.category}</div>
      <h2 className="lead-title">{post.title}</h2>
      <p className="lead-excerpt">{post.excerpt}</p>
      <div className="byline-row">{post.date} <span>·</span> {post.readTime} read <span className="cont">Continue reading →</span></div>
    </PostLink>
  );
}

function Row({ post, onOpen }) {
  return (
    <PostLink post={post} onOpen={onOpen} className="row">
      <div className="row-date">{post.date}</div>
      <div className="row-body">
        <div className="kicker">{post.category}</div>
        <h3 className="row-title">{post.title}</h3>
        <p className="row-excerpt">{post.excerpt}</p>
        <div className="row-read">{post.readTime} read</div>
      </div>
    </PostLink>
  );
}

function Home({ s }) {
  const [lead, ...rest] = s.filtered;
  return (
    <main>
      <section className="intro">
        <h1>Half-formed thoughts on AI, work, and <em>being a person</em> while it all changes.</h1>
        <p className="lede">This is where I write about what I'm building, what I'm worried about, and what AI doesn't quite reach.</p>
      </section>
      <CategoryTabs active={s.active} setActive={s.setActive} posts={s.posts} />
      {s.filtered.length === 0 ? (
        <p className="empty">Nothing in this category yet — check back soon.</p>
      ) : (
        <React.Fragment>
          <Lead post={lead} onOpen={s.setOpenId} />
          <div className="rows">{rest.map(p => <Row key={p.id} post={p} onOpen={s.setOpenId} />)}</div>
        </React.Fragment>
      )}
      <AboutBand />
    </main>
  );
}

function AboutBand() {
  return (
    <section className="about-band">
      <div className="about">
        <div className="kicker">About</div>
        <h3>Aravind Singirikonda</h3>
        <a className="about-link" href="https://www.linkedin.com/in/aravindsingirikonda" target="_blank" rel="noopener">LinkedIn · /in/aravindsingirikonda</a>
        <p className="disclaimer">{DISCLAIMER}</p>
      </div>
      <div className="letter">
        <div className="kicker">Newsletter</div>
        <h3>Get new notes by email</h3>
        <p>One short essay every other week — what I'm building, what I'm worried about, and what AI doesn't quite reach.</p>
        <SubscribeForm />
      </div>
    </section>
  );
}

function MoreToRead({ posts, onOpen }) {
  const top = posts.slice(0, 4);
  if (!top.length) return null;
  return (
    <section className="more">
      <div className="kicker">Most read this month</div>
      <ol>
        {top.map(p => (
          <li key={p.id}><PostLink post={p} onOpen={onOpen}><span className="more-title">{p.title}</span><span className="more-meta">{p.readTime} read</span></PostLink></li>
        ))}
      </ol>
    </section>
  );
}

function Post({ s }) {
  const post = s.openPost;
  return (
    <main className="article">
      <a className="back" href="/" onClick={(e) => { if (navClick(e)) { e.preventDefault(); s.setOpenId(null); } }}>← All writing</a>
      <header className="article-head">
        <div className="kicker">{post.category}</div>
        <h1 className="article-title">{post.title}</h1>
        <p className="article-dek">{post.excerpt}</p>
        <div className="byline-row">By Aravind Singirikonda <span>·</span> {post.date} <span>·</span> {post.readTime} read</div>
      </header>
      <LikeButton id={post.id} />
      <p className="disclaimer">{DISCLAIMER}</p>
      {post.banner && (
        <figure className="post-banner"><img src={post.banner} alt={post.bannerAlt || post.title} loading="eager" /></figure>
      )}
      <Prose post={post} />
      <div className="endmark"><span className="fleuron">❦</span><span>Thanks for reading. Reply by email if something landed.</span></div>
      <section className="letter letter-inline">
        <div className="kicker">Newsletter</div>
        <h3>Get new notes by email</h3>
        <p>One short essay every other week — what I'm building, what I'm worried about, and what AI doesn't quite reach.</p>
        <SubscribeForm />
      </section>
      <MoreToRead posts={s.posts.filter(p => p.id !== post.id)} onOpen={s.setOpenId} />
      <Giscus postId={post.id} theme={s.theme} />
    </main>
  );
}

function Footer() {
  return (
    <footer className="foot">
      <div>© 2026 Aravind Singirikonda · Opinions here are mine alone.</div>
      <div>Set in Newsreader &amp; Inter. Built by hand. Cumming, GA · 34.21° N</div>
    </footer>
  );
}

function App() {
  const s = useBlogState("paper");
  return (
    <div className="shell">
      <Masthead onHome={() => s.setOpenId(null)} theme={s.theme} setTheme={s.setTheme} />
      {s.openPost ? <Post s={s} /> : <Home s={s} />}
      <Footer />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
