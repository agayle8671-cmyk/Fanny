// EditorialPanels.jsx — Supporting panels for the Editorial Desk
import { useState, useEffect } from "react";
import { getFallbackImage } from "../lib/fallback-image";

// ─── Design tokens — hardcoded to match EditorialDesk.jsx ─────────────────────
const C = {
  bg:       "#030305",
  surface:  "#0d0d12",
  surface2: "#08080c",
  border:   "rgba(255,255,255,0.06)",
  border2:  "rgba(255,255,255,0.1)",
  text:     "#ffffff",
  text2:    "#a1a1aa",
  text3:    "#52525b",
  red:      "#FF2A6D",
  redDim:   "rgba(255,42,109,0.12)",
  redText:  "#FF2A6D",
  green:    "#22C55E",
  greenDim: "rgba(34,197,94,0.12)",
  amber:    "#FF7B00",
  amberDim: "rgba(255,123,0,0.12)",
  blue:     "#05D9E8",
  blueDim:  "rgba(5,217,232,0.12)",
};

const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

// ─── Shared helpers ───────────────────────────────────────────────────────────
let BASE_URL = process.env.REACT_APP_BACKEND_URL || "";
if (!BASE_URL) {
  BASE_URL = "https://fanny-production-4c28.up.railway.app";
}
BASE_URL = BASE_URL.trim();
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}
if (BASE_URL && !BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = `https://${BASE_URL}`;
}
const API_BASE = `${BASE_URL}/api`;

export function apiCall(path, key, method = "GET", body) {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-Editorial-Key": key },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async r => {
    if (!r.ok) {
      const errText = await r.text();
      let detail = `HTTP ${r.status}`;
      try {
        const parsed = JSON.parse(errText);
        detail = parsed.detail || parsed.message || detail;
      } catch (_) {}
      throw new Error(detail);
    }
    return r.json();
  });
}

export const REJECTION_REASONS = ["Off-topic", "AI hallucination", "Duplicate", "Low quality", "Misleading title", "Outdated", "Other"];

// ─── Shared sub-components ────────────────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "#FF2A6D", textTransform: "uppercase", marginBottom: 2 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: "#888" }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "#0d0d12", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = "#FF2A6D", outline = false, disabled = false, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: outline ? "transparent" : color, border: `1px solid ${color}`, color: outline ? color : "#fff", padding: "8px 16px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, opacity: disabled ? 0.6 : 1, transition: "all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, onKeyDown, style }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
      className="ed-input"
      style={{ width: "100%", padding: "9px 12px", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, fontSize: 13, color: "#fff", background: "#08080c", fontFamily: "inherit", ...style }} />
  );
}

// ─── Published Panel ──────────────────────────────────────────────────────────
function liveHref(a) { return a.slug ? `/news/${a.slug}` : a.sourceUrl; }

function ArticleThumb({ article }) {
  const thumb = article.imageThumbnail || article.videoThumbnail || getFallbackImage(article.category, article.id);
  return (
    <a href={liveHref(article)} target="_blank" rel="noreferrer" className="ed-thumb"
      style={{ display: "block", flexShrink: 0, width: 100, height: 68, borderRadius: 8, overflow: "hidden", position: "relative" }}>
      <img src={thumb} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
        onError={e => { e.target.src = getFallbackImage(article.category, article.id); }} />
      <div className="ed-thumb-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>⇗</div>
    </a>
  );
}

export function PublishedPanel({ apiKey }) {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    const q = `search=${encodeURIComponent(search)}&category=${category}&limit=30`;
    try {
      const d = await apiCall(`/editorial/published?${q}`, apiKey);
      setArticles(d.articles ?? []);
      setTotal(d.total ?? 0);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const unpublish = async (id) => { await apiCall(`/editorial/unpublish/${id}`, apiKey, "POST"); load(); };
  const hardDelete = async (id) => { await apiCall(`/editorial/article/${id}`, apiKey, "DELETE"); setConfirmDelete(null); load(); };
  const setHero = async (id) => { await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST"); load(); };

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Published Articles" sub={`${total} articles${loading ? " — loading…" : ""}`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Input value={search} onChange={setSearch} placeholder="Search title or source…" onKeyDown={e => e.key === "Enter" && load()} style={{ flex: 1, minWidth: 200 }} />
        <select value={category} onChange={e => setCategory(e.target.value)} className="ed-input" style={{ padding: "9px 12px", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, fontSize: 13, color: "#fff", background: "#0d0d12", cursor: "pointer" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Btn onClick={load}>Search</Btn>
      </div>

      {articles.map(a => (
        <Card key={a.id}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <ArticleThumb article={a} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ background: "rgba(255,42,109,0.12)", color: "#FF2A6D", border: `1px solid rgba(255,42,109,0.2)`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{a.category}</span>
                <span style={{ color: "#888", fontSize: 11 }}>{a.sourceName}</span>
                {a.isFeatured && <span style={{ background: "rgba(245,166,35,0.15)", color: "#FF7B00", border: `1px solid rgba(245,166,35,0.3)`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 7px" }}>⭐ HERO</span>}
                <span style={{ color: "#52525b", fontSize: 11, marginLeft: "auto" }}>{new Date(a.scrapedAt).toLocaleDateString()}</span>
              </div>
              <a href={liveHref(a)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{a.title}</div>
              </a>
              {a.aiSummary && <div style={{ color: "#a1a1aa", fontSize: 12, lineHeight: 1.55 }}>{a.aiSummary.slice(0, 140)}…</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              {!a.isFeatured && <Btn onClick={() => setHero(a.id)} color="#FF7B00" outline style={{ fontSize: 11, padding: "6px 12px" }}>⭐ Set Hero</Btn>}
              <Btn onClick={() => unpublish(a.id)} color="#888" outline style={{ fontSize: 11, padding: "6px 12px" }}>↩ Unpublish</Btn>
              {confirmDelete === a.id
                ? <Btn onClick={() => hardDelete(a.id)} style={{ fontSize: 11, padding: "6px 12px" }}>⚠ Confirm</Btn>
                : <Btn onClick={() => setConfirmDelete(a.id)} outline style={{ fontSize: 11, padding: "6px 12px" }}>✕ Delete</Btn>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Scraper Panel ────────────────────────────────────────────────────────────
export function ScraperPanel({ apiKey }) {
  const [status, setStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const load = async () => {
    try {
      const d = await apiCall("/editorial/scraper/status", apiKey);
      setStatus(d);
    } catch (_) {}
  };
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const trigger = async () => {
    setTriggering(true);
    try {
      await apiCall("/editorial/scraper/trigger", apiKey, "POST");
    } catch (_) {}
    setTimeout(() => { load(); setTriggering(false); }, 2000);
  };

  const isRunning = status?.isRunning;
  const lastRun = status?.recentRuns?.[0] ?? null;
  const statusColor = isRunning ? "#FF7B00" : lastRun?.status === "failed" ? "#EF4444" : "#22C55E";
  const statusLabel = isRunning ? "RUNNING" : lastRun?.status?.toUpperCase() ?? "IDLE";

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Scraper Control" sub="Monitor and trigger the news collection pipeline" />

      {/* Status card */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}88` }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: statusColor, fontFamily: "'Inter', sans-serif" }}>{statusLabel}</div>
              {status?.nextRunIn && status.nextRunIn !== "Not scheduled" && <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>Next run in {status.nextRunIn}</div>}
            </div>
          </div>
          <Btn onClick={trigger} disabled={triggering || !!isRunning} color={isRunning ? "#3f3f46" : "#22C55E"} style={{ minWidth: 120 }}>
            {triggering ? "Triggering…" : isRunning ? "⏳ Running" : "▶ Run Now"}
          </Btn>
        </div>

        {lastRun && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Last Run", value: new Date(lastRun.startedAt).toLocaleString() },
              { label: "New Articles", value: String(lastRun.articlesNew ?? 0) },
              { label: "Sources OK", value: String(lastRun.sourcesProcessed ?? 0) },
              { label: "Failed", value: String(lastRun.sourcesFailed ?? 0) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "#08080c", borderRadius: 8, padding: "10px 12px", border: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Run history */}
      <SectionHeader title="Run History" />
      {status?.recentRuns?.map((r, i) => (
        <Card key={r.runId || i} style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ background: r.status === "completed" ? "rgba(34,197,94,0.15)" : r.status === "running" ? "rgba(255,123,0,0.15)" : "rgba(239,68,68,0.15)", color: r.status === "completed" ? "#22C55E" : r.status === "running" ? "#FF7B00" : "#EF4444", border: `1px solid ${r.status === "completed" ? "#22C55E" : r.status === "running" ? "#FF7B00" : "#EF4444"}33`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 8px", textTransform: "uppercase" }}>
                {r.status}
              </span>
              <span style={{ color: "#a1a1aa", fontSize: 12 }}>{new Date(r.startedAt).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ color: "#22C55E", fontWeight: 600 }}>+{r.articlesNew} new</span>
              <span style={{ color: r.sourcesFailed > 0 ? "#EF4444" : "#888" }}>{r.sourcesFailed} failed</span>
              {r.errorMsg && <span style={{ color: "#EF4444" }} title={r.errorMsg}>⚠ Error</span>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Sources Panel ────────────────────────────────────────────────────────────
export function SourcesPanel({ apiKey }) {
  const [sources, setSources] = useState([]);
  const load = async () => {
    try {
      const d = await apiCall("/editorial/sources", apiKey);
      setSources(d.sources ?? []);
    } catch (_) {}
  };
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = async (name) => {
    try {
      const d = await apiCall(`/editorial/sources/${name}/toggle`, apiKey, "POST");
      setSources(prev => prev.map(s => s.name === name ? { ...s, isActive: d.isActive } : s));
    } catch (_) {}
  };

  const active = sources.filter(s => s.isActive).length;

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="News Sources" sub={`${active} of ${sources.length} sources active`} />
      {sources.map(s => (
        <Card key={s.name} style={{ padding: "14px 18px", opacity: s.isActive ? 1 : 0.55 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 5 }}>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ background: "#08080c", color: "#888", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "1px 6px", textTransform: "uppercase" }}>{s.type}</span>
                <span style={{ background: "#08080c", color: "#888", border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "1px 6px", textTransform: "uppercase" }}>{s.category}</span>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                <span style={{ color: "#22C55E", fontWeight: 600 }}>✓ {s.successCount || 0}</span>
                <span style={{ color: (s.failCount || 0) > 5 ? "#EF4444" : "#888" }}>✕ {s.failCount || 0}</span>
                <span style={{ color: "#888" }}>{s.lastScrapedAt ? new Date(s.lastScrapedAt).toLocaleDateString() : "Never scraped"}</span>
                {s.lastError && <span style={{ color: "#EF4444" }} title={s.lastError}>⚠ Error</span>}
              </div>
            </div>
            <button onClick={() => toggle(s.name)} style={{ background: s.isActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", border: `1px solid ${s.isActive ? "#22C55E" : "#EF4444"}`, color: s.isActive ? "#22C55E" : "#EF4444", padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, flexShrink: 0, minWidth: 64, transition: "all 0.15s" }}>
              {s.isActive ? "ON" : "OFF"}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Site Panel ───────────────────────────────────────────────────────────────
export function SitePanel({ apiKey }) {
  const [hero, setHero] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [tickerSaved, setTickerSaved] = useState(false);
  const [heroSearch, setHeroSearch] = useState("");
  const [heroResults, setHeroResults] = useState([]);

  useEffect(() => {
    apiCall("/editorial/hero", apiKey).then(d => setHero(d.hero));
    apiCall("/editorial/ticker", apiKey).then(d => setTickerItems(d.items ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const searchHero = async () => {
    const d = await apiCall(`/editorial/published?search=${encodeURIComponent(heroSearch)}&limit=5`, apiKey);
    setHeroResults(d.articles ?? []);
  };

  const pinHero = async (id) => {
    const d = await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST");
    if (d.success) {
      const hd = await apiCall("/editorial/hero", apiKey);
      setHero(hd.hero);
      setHeroResults([]);
      setHeroSearch("");
    }
  };

  const saveTicker = async () => {
    await apiCall("/editorial/ticker", apiKey, "PUT", { items: tickerItems });
    setTickerSaved(true); setTimeout(() => setTickerSaved(false), 2000);
  };

  const updateTicker = (i, val) => setTickerItems(prev => prev.map((x, idx) => idx === i ? val : x));
  const removeTicker = (i) => setTickerItems(prev => prev.filter((_, idx) => idx !== i));

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Site Controls" sub="Hero pin, breaking ticker, and site-wide settings" />

      {/* Hero Pin */}
      <Card>
        <Label>Pinned Hero Article</Label>
        {hero ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, padding: "12px 14px", background: "rgba(255,123,0,0.15)", borderRadius: 8, border: `1px solid rgba(255,123,0,0.3)` }}>
            {hero.imageThumbnail && <img src={hero.imageThumbnail} alt="" style={{ width: 72, height: 50, objectFit: "cover", borderRadius: 6 }} />}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#FF7B00", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>⭐ Current Hero</div>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{hero.title}</div>
              <div style={{ color: "#888", fontSize: 11, marginTop: 2 }}>{hero.sourceName} · {new Date(hero.scrapedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: "#888", fontSize: 13, marginBottom: 16, padding: "12px 14px", background: "#08080c", borderRadius: 8, border: `1px solid rgba(255,255,255,0.06)` }}>No hero article pinned — the latest article will be used automatically</div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Input value={heroSearch} onChange={setHeroSearch} placeholder="Search published articles…" onKeyDown={e => e.key === "Enter" && searchHero()} />
          <Btn onClick={searchHero}>Search</Btn>
        </div>
        {heroResults.map(a => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#08080c", borderRadius: 8, border: `1px solid rgba(255,255,255,0.06)`, marginBottom: 6 }}>
            <span style={{ color: "#fff", fontSize: 13, flex: 1, marginRight: 12 }}>{a.title}</span>
            <Btn onClick={() => pinHero(a.id)} color="#FF7B00" style={{ fontSize: 11, padding: "6px 12px" }}>⭐ Pin</Btn>
          </div>
        ))}
      </Card>

      {/* Ticker Editor */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Label>Breaking Ticker Items</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setTickerItems(prev => [...prev, ""])} color="#a1a1aa" outline style={{ fontSize: 11, padding: "6px 12px" }}>+ Add</Btn>
            <Btn onClick={saveTicker} color={tickerSaved ? "#22C55E" : "#FF2A6D"} style={{ fontSize: 11, padding: "6px 16px", minWidth: 100 }}>
              {tickerSaved ? "✓ Saved!" : "Save Ticker"}
            </Btn>
          </div>
        </div>
        <div style={{ color: "#888", fontSize: 11, marginBottom: 14 }}>Edit in place · Changes appear on site immediately after save</div>
        {tickerItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ color: "#888", fontSize: 12, width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}.</span>
            <Input value={item} onChange={v => updateTicker(i, v)} />
            <button onClick={() => removeTicker(i)} style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.06)`, color: "#888", width: 32, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Timeline Panel ───────────────────────────────────────────────────────────
export function TimelinePanel({ apiKey }) {
  const [timeline, setTimeline] = useState([]);
  const [reasons, setReasons] = useState([]);
  useEffect(() => { apiCall("/editorial/timeline", apiKey).then(d => { setTimeline(d.timeline ?? []); setReasons(d.reasonBreakdown ?? []); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const maxPub = Math.max(...timeline.map(d => Number(d.published)), 1);

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Publishing Timeline" sub="7-day activity and rejection pattern analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <Label>7-Day Publishing Activity</Label>
          {timeline.length === 0 && <div style={{ color: "#888", fontSize: 13 }}>No data yet.</div>}
          {timeline.map(d => (
            <div key={d.day} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: "#a1a1aa", fontWeight: 500 }}>{new Date(d.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: "#22C55E", fontWeight: 700 }}>+{d.published}</span>
                  <span style={{ color: "#EF4444" }}>✕{d.rejected}</span>
                </div>
              </div>
              <div style={{ height: 6, background: "#08080c", borderRadius: 3, border: `1px solid rgba(255,255,255,0.06)` }}>
                <div style={{ height: "100%", width: `${(Number(d.published) / maxPub) * 100}%`, background: "#22C55E", borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <Label>Rejection Reasons (30 Days)</Label>
          {reasons.length === 0 && <div style={{ color: "#888", fontSize: 13 }}>No tracked rejections yet.</div>}
          {reasons.map(r => {
            const total = reasons.reduce((s, x) => s + Number(x.count), 0);
            const pct = Math.round((Number(r.count) / total) * 100);
            return (
              <div key={r.rejection_reason} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#a1a1aa", fontWeight: 500 }}>{r.rejection_reason}</span>
                  <span style={{ color: "#EF4444", fontWeight: 700 }}>{r.count} ({pct}%)</span>
                </div>
                <div style={{ height: 5, background: "#08080c", borderRadius: 3, border: `1px solid rgba(255,255,255,0.06)` }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#EF4444", borderRadius: 3, transition: "width 0.4s" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

// ─── Manual Entry Panel ───────────────────────────────────────────────────────
export function ManualEntryPanel({ apiKey }) {
  const [form, setForm] = useState({ title: "", excerpt: "", aiSummary: "", category: "Intel", sourceUrl: "", sourceName: "", imageThumbnail: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!form.title || !form.sourceUrl || !form.sourceName) { setErr("Title, Source URL, and Source Name are required."); return; }
    setSaving(true); setErr("");
    try {
      const d = await apiCall("/editorial/manual-article", apiKey, "POST", { ...form, imageThumbnail: form.imageThumbnail || undefined });
      if (d.success) {
        setSaved(true);
        setForm({ title: "", excerpt: "", aiSummary: "", category: "Intel", sourceUrl: "", sourceName: "", imageThumbnail: "" });
        setTimeout(() => setSaved(false), 3000);
      } else {
        setErr(d.error ?? "Unknown error");
      }
    } catch (e) {
      setErr(e.message);
    }
    setSaving(false);
  };

  const field = (lbl, k, ph, multi) => (
    <div style={{ marginBottom: 16 }}>
      <Label>{lbl}</Label>
      {multi
        ? <textarea value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={ph} rows={4} className="ed-input" style={{ width: "100%", padding: "10px 12px", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, fontSize: 13, color: "#fff", background: "#08080c", resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
        : <Input value={form[k]} onChange={v => upd(k, v)} placeholder={ph} />}
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Manual Article Entry" sub="Publish a custom article directly to the site — bypasses the scraper, goes live immediately" />
      <Card style={{ maxWidth: 680 }}>
        {field("Title *", "title", "e.g. GTA VI release date officially confirmed…")}
        <div style={{ marginBottom: 16 }}>
          <Label>Category *</Label>
          <select value={form.category} onChange={e => upd("category", e.target.value)} className="ed-input" style={{ padding: "9px 12px", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 8, fontSize: 13, color: "#fff", background: "#0d0d12", cursor: "pointer" }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {field("Source URL *", "sourceUrl", "https://rockstarintel.com/…")}
        {field("Source Name *", "sourceName", "e.g. Rockstar Intel")}
        {field("Excerpt / Raw Text", "excerpt", "Paste original article text here…", true)}
        {field("AI Summary", "aiSummary", "Write a clean 2–3 sentence summary…", true)}
        {field("Image URL (optional)", "imageThumbnail", "https://cdn.example.com/image.jpg")}

        {err && (
          <div style={{ color: "#EF4444", fontSize: 12, marginBottom: 16, padding: "10px 14px", background: "rgba(239,68,68,0.15)", borderRadius: 8, border: `1px solid rgba(239,68,68,0.3)` }}>{err}</div>
        )}
        <Btn onClick={submit} disabled={saving} color={saved ? "#22C55E" : "#FF2A6D"} style={{ padding: "12px 32px", fontSize: 13 }}>
          {saving ? "Publishing…" : saved ? "✓ Published!" : "Publish Article →"}
        </Btn>
      </Card>
    </div>
  );
}
