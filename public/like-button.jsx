// Lyket like button.
//
// The drop-in Lyket widget only scans the DOM once on load and never re-scans,
// so it can't see buttons that this React SPA renders during client-side
// navigation. This component talks to the Lyket REST API directly instead, so
// counts load on mount and update on press no matter how you got to the page.
//
// LYKET_API_KEY is your *public* key — it is meant to ship in client-side JS
// (the official widget puts it right in its <script> URL). Paste it below.
// Until then the button hides itself, exactly like the Giscus block does.
const LYKET_API_KEY = "pt_d13e5f09490f4bec276645955df06b";
const LYKET_API = "https://api.lyket.dev/v1";

function LikeButton({ id, namespace = "in-context" }) {
  const [total, setTotal] = React.useState(null);
  const [liked, setLiked] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const enabled = !LYKET_API_KEY.startsWith("REPLACE_");
  const path =
    `/like-buttons/${encodeURIComponent(namespace)}/${encodeURIComponent(id)}`;

  const apply = (json) => {
    const a = (json && json.data && json.data.attributes) || {};
    setTotal(typeof a.total_likes === "number" ? a.total_likes : 0);
    setLiked(!!a.user_has_liked);
  };

  // Load the current count whenever the post (id) changes.
  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setTotal(null);
    setLiked(false);
    fetch(LYKET_API + path, {
      headers: { Authorization: `Bearer ${LYKET_API_KEY}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => { if (alive) apply(j); })
      .catch(() => {});
    return () => { alive = false; };
  }, [id, namespace]);

  const press = () => {
    if (!enabled || busy) return;
    setBusy(true);
    fetch(LYKET_API + path + "/press", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${LYKET_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(apply)
      .catch(() => {})
      .finally(() => setBusy(false));
  };

  // Hidden until a real API key is set — mirrors the Giscus pattern.
  if (!enabled) return null;

  return (
    <div className="lyket-like">
      <button
        type="button"
        className={"lyket-like-btn" + (liked ? " liked" : "")}
        onClick={press}
        disabled={busy}
        aria-pressed={liked}
        aria-label={liked ? "Remove like" : "Like this"}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path
            d="M12 20.5S3.5 15.4 3.5 9.5C3.5 6.9 5.4 5 7.8 5c1.6 0 3 .9 3.7 2.2h1C13.2 5.9 14.6 5 16.2 5c2.4 0 4.3 1.9 4.3 4.5 0 5.9-8.5 11-8.5 11z"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <span className="lyket-like-count">{total == null ? "·" : total}</span>
        <span className="lyket-like-label">{total === 1 ? "like" : "likes"}</span>
      </button>
    </div>
  );
}
