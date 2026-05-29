// EditorialPanels.jsx — direct port of old EditorialPanels.tsx (TypeScript stripped)
import { useState, useEffect } from "react";
import { getFallbackImage } from "../lib/fallback-image";

// ─── Design tokens (matches old site exactly) ─────────────────────────────────
const C = {
  bg:       "var(--bg-page, #f5f0e8)",
  surface:  "var(--bg-surface, #ffffff)",
  surface2: "var(--bg-elevated, #f0ebe0)",
  border:   "rgba(0,0,0,0.08)",
  border2:  "rgba(0,0,0,0.12)",
  text:     "var(--text-primary, #1a1a1a)",
  text2:    "var(--text-secondary, #4a4a4a)",
  text3:    "var(--text-muted, #888888)",
  red:      "#C41230",
  redDim:   "rgba(196,18,48,0.1)",
  redText:  "#C41230",
  green:    "#1A7A3C",
  greenDim: "rgba(26,122,60,0.15)",
  amber:    "#B45309",
  amberDim: "rgba(245,166,35,0.15)",
  blue:     "#1D4ED8",
  blueDim:  "rgba(59,130,246,0.15)",
  sidebar:  "#1a1a1a",
};

const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

// ─── API helper ───────────────────────────────────────────────────────────────
let BASE_URL = process.env.REACT_APP_BACKEND_URL || "";
if (!BASE_URL) BASE_URL = "https://fanny-production-4c28.up.railway.app";
BASE_URL = BASE_URL.trim();
if (BASE_URL.endsWith("/")) BASE_URL = BASE_URL.slice(0, -1);
if (BASE_URL && !BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) BASE_URL = `https://${BASE_URL}`;
const API_BASE = `${BASE_URL}/api`;

export function apiCall(path, key, method = "GET", body) {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-Editorial-Key": key },
    body: body ? JSON.stringify(body) : undefined,
  }).then(r => r.json());
}

export const REJECTION_REASONS = ["Off-topic", "AI hallucination", "Duplicate", "Low quality", "Misleading title", "Outdated", "Other"];

// ─── Shared sub-components ────────────────────────────────────────────────────
function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.red, textTransform: "uppercase", marginBottom: 2 }}>{title}</div>
      {sub && <div style={{ fontSize: 12, color: C.text3 }}>{sub}</div>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, color, outline = false, disabled = false, style }) {
  const c = color || C.red;
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: outline ? "transparent" : c, border: `1px solid ${c}`, color: outline ? c : "#fff", padding: "8px 16px", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, opacity: disabled ? 0.6 : 1, transition: "all 0.15s", ...style }}>
      {children}
    </button>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.text3, textTransform: "uppercase", marginBottom: 6 }}>{children}</div>;
}

function Input({ value, onChange, placeholder, onKeyDown, style }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} onKeyDown={onKeyDown}
      className="ed-input"
      style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, fontFamily: "inherit", ...style }} />
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
    const d = await apiCall(`/editorial/published?${q}`, apiKey);
    setArticles(d.articles ?? []);
    setTotal(d.total ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [category]); // eslint-disable-line

  const unpublish = async (id) => { await apiCall(`/editorial/unpublish/${id}`, apiKey, "POST"); load(); };
  const hardDelete = async (id) => { await apiCall(`/editorial/article/${id}`, apiKey, "DELETE"); setConfirmDelete(null); load(); };
  const setHero = async (id) => { await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST"); load(); };

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Published Articles" sub={`${total} articles${loading ? " — loading…" : ""}`} />

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <Input value={search} onChange={setSearch} placeholder="Search title or source…" onKeyDown={e => e.key === "Enter" && load()} style={{ flex: 1, minWidth: 200 }} />
        <select value={category} onChange={e => setCategory(e.target.value)} className="ed-input" style={{ padding: "9px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, cursor: "pointer" }}>
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
                <span style={{ background: C.surface2, color: C.text2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{a.category}</span>
                <span style={{ color: C.text3, fontSize: 11 }}>{a.sourceName}</span>
                {a.isFeatured && <span style={{ background: C.amberDim, color: C.amber, border: `1px solid ${C.amber}33`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 7px" }}>⭐ HERO</span>}
                <span style={{ color: C.text3, fontSize: 11, marginLeft: "auto" }}>{new Date(a.scrapedAt).toLocaleDateString()}</span>
              </div>
              <a href={liveHref(a)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }}>{a.title}</div>
              </a>
              {a.aiSummary && <div style={{ color: C.text2, fontSize: 12, lineHeight: 1.55 }}>{a.aiSummary.slice(0, 140)}…</div>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
              {!a.isFeatured && <Btn onClick={() => setHero(a.id)} color={C.amber} outline style={{ fontSize: 11, padding: "6px 12px" }}>⭐ Set Hero</Btn>}
              <Btn onClick={() => unpublish(a.id)} color={C.text3} outline style={{ fontSize: 11, padding: "6px 12px" }}>↩ Unpublish</Btn>
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
  useEffect(() => { load(); const t = setInterval(load, 10000); return () => clearInterval(t); }, []); // eslint-disable-line

  const trigger = async () => {
    setTriggering(true);
    await apiCall("/editorial/scraper/trigger", apiKey, "POST");
    setTimeout(() => { load(); setTriggering(false); }, 2000);
  };

  const isRunning = status?.isRunning;
  const lastRun = status?.recentRuns?.[0] ?? null;
  const statusColor = isRunning ? C.amber : lastRun?.status === "failed" ? C.red : C.green;
  const statusLabel = isRunning ? "RUNNING" : lastRun?.status?.toUpperCase() ?? "IDLE";

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Scraper Control" sub="Monitor and trigger the news collection pipeline" />

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}88` }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: statusColor, fontFamily: "'Playfair Display', serif" }}>{statusLabel}</div>
              {status?.nextRunIn && status.nextRunIn !== "Not scheduled" && <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>Next run in {status.nextRunIn}</div>}
            </div>
          </div>
          <Btn onClick={trigger} disabled={triggering || !!isRunning} color={isRunning ? C.text3 : C.green} style={{ minWidth: 120 }}>
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
              <div key={label} style={{ background: C.surface2, borderRadius: 8, padding: "10px 12px", border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: C.text3, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <SectionHeader title="Run History" />
      {status?.recentRuns?.map((r, i) => (
        <Card key={r.runId || i} style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ background: r.status === "completed" ? C.greenDim : r.status === "running" ? C.amberDim : C.redDim, color: r.status === "completed" ? C.green : r.status === "running" ? C.amber : C.red, border: `1px solid ${r.status === "completed" ? C.green : r.status === "running" ? C.amber : C.red}33`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 8px", textTransform: "uppercase" }}>
                {r.status}
              </span>
              <span style={{ color: C.text2, fontSize: 12 }}>{new Date(r.startedAt).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
              <span style={{ color: C.green, fontWeight: 600 }}>+{r.articlesNew ?? 0} new</span>
              <span style={{ color: (r.sourcesFailed ?? 0) > 0 ? C.red : C.text3 }}>{r.sourcesFailed ?? 0} failed</span>
              {r.errorMsg && <span style={{ color: C.red }} title={r.errorMsg}>⚠ Error</span>}
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

  useEffect(() => {
    apiCall("/editorial/sources", apiKey).then(d => setSources(d.sources ?? []));
  }, []); // eslint-disable-line

  const toggle = async (name) => {
    const d = await apiCall(`/editorial/sources/${name}/toggle`, apiKey, "POST");
    setSources(prev => prev.map(s => s.name === name ? { ...s, isActive: d.isActive } : s));
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
                <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{s.name}</span>
                <span style={{ background: C.surface2, color: C.text3, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "1px 6px", textTransform: "uppercase" }}>{s.type}</span>
                <span style={{ background: C.surface2, color: C.text3, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "1px 6px", textTransform: "uppercase" }}>{s.category}</span>
              </div>
              <div style={{ display: "flex", gap: 14, fontSize: 11 }}>
                <span style={{ color: C.green, fontWeight: 600 }}>✓ {s.successCount || 0}</span>
                <span style={{ color: (s.failCount || 0) > 5 ? C.red : C.text3 }}>✕ {s.failCount || 0}</span>
                <span style={{ color: C.text3 }}>{s.lastScrapedAt ? new Date(s.lastScrapedAt).toLocaleDateString() : "Never scraped"}</span>
                {s.lastError && <span style={{ color: C.red }} title={s.lastError}>⚠ Error</span>}
              </div>
            </div>
            <button onClick={() => toggle(s.name)} style={{ background: s.isActive ? C.greenDim : C.redDim, border: `1px solid ${s.isActive ? C.green : C.red}`, color: s.isActive ? C.green : C.red, padding: "7px 18px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 12, flexShrink: 0, minWidth: 64, transition: "all 0.15s" }}>
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
  }, []); // eslint-disable-line

  const searchHero = async () => {
    const d = await apiCall(`/editorial/published?search=${encodeURIComponent(heroSearch)}&limit=5`, apiKey);
    setHeroResults(d.articles ?? []);
  };

  const pinHero = async (id) => {
    const d = await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST");
    if (d.success) {
      const hd = await apiCall("/editorial/hero", apiKey);
      setHero(hd.hero); setHeroResults([]); setHeroSearch("");
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

      <Card>
        <Label>Pinned Hero Article</Label>
        {hero ? (
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, padding: "12px 14px", background: C.amberDim, borderRadius: 8, border: `1px solid ${C.amber}33` }}>
            {hero.imageThumbnail && <img src={hero.imageThumbnail} alt="" style={{ width: 72, height: 50, objectFit: "cover", borderRadius: 6 }} />}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>⭐ Current Hero</div>
              <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{hero.title}</div>
              <div style={{ color: C.text3, fontSize: 11, marginTop: 2 }}>{hero.sourceName} · {new Date(hero.scrapedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: C.text3, fontSize: 13, marginBottom: 16, padding: "12px 14px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>No hero article pinned — the latest article will be used automatically</div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <Input value={heroSearch} onChange={setHeroSearch} placeholder="Search published articles…" onKeyDown={e => e.key === "Enter" && searchHero()} />
          <Btn onClick={searchHero}>Search</Btn>
        </div>
        {heroResults.map(a => (
          <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
            <span style={{ color: C.text, fontSize: 13, flex: 1, marginRight: 12 }}>{a.title}</span>
            <Btn onClick={() => pinHero(a.id)} color={C.amber} style={{ fontSize: 11, padding: "6px 12px" }}>⭐ Pin</Btn>
          </div>
        ))}
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <Label>Breaking Ticker Items</Label>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={() => setTickerItems(prev => [...prev, ""])} color={C.text2} outline style={{ fontSize: 11, padding: "6px 12px" }}>+ Add</Btn>
            <Btn onClick={saveTicker} color={tickerSaved ? C.green : C.red} style={{ fontSize: 11, padding: "6px 16px", minWidth: 100 }}>
              {tickerSaved ? "✓ Saved!" : "Save Ticker"}
            </Btn>
          </div>
        </div>
        <div style={{ color: C.text3, fontSize: 11, marginBottom: 14 }}>Edit in place · Changes appear on site immediately after save</div>
        {tickerItems.map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
            <span style={{ color: C.text3, fontSize: 12, width: 20, textAlign: "right", flexShrink: 0 }}>{i + 1}.</span>
            <Input value={item} onChange={v => updateTicker(i, v)} />
            <button onClick={() => removeTicker(i)} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text3, width: 32, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
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

  useEffect(() => {
    apiCall("/editorial/timeline", apiKey).then(d => {
      setTimeline(d.timeline ?? []);
      setReasons(d.reasonBreakdown ?? []);
    });
  }, []); // eslint-disable-line

  const maxPub = Math.max(...timeline.map(d => Number(d.published)), 1);

  return (
    <div style={{ padding: 24 }}>
      <SectionHeader title="Publishing Timeline" sub="7-day activity and rejection pattern analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <Label>7-Day Publishing Activity</Label>
          {timeline.length === 0 && <div style={{ color: C.text3, fontSize: 13 }}>No data yet.</div>}
          {timeline.map(d => (
            <div key={d.day} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                <span style={{ color: C.text2, fontWeight: 500 }}>{new Date(d.day).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <div style={{ display: "flex", gap: 10 }}>
                  <span style={{ color: C.green, fontWeight: 700 }}>+{d.published}</span>
                  <span style={{ color: C.red }}>✕{d.rejected}</span>
                </div>
              </div>
              <div style={{ height: 6, background: C.surface2, borderRadius: 3, border: `1px solid ${C.border}` }}>
                <div style={{ height: "100%", width: `${(Number(d.published) / maxPub) * 100}%`, background: C.green, borderRadius: 3, transition: "width 0.4s" }} />
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <Label>Rejection Reasons (30 Days)</Label>
          {reasons.length === 0 && <div style={{ color: C.text3, fontSize: 13 }}>No tracked rejections yet.</div>}
          {reasons.map(r => {
            const total = reasons.reduce((s, x) => s + Number(x.count), 0);
            const pct = Math.round((Number(r.count) / total) * 100);
            return (
              <div key={r.rejection_reason} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: C.text2, fontWeight: 500 }}>{r.rejection_reason}</span>
                  <span style={{ color: C.red, fontWeight: 700 }}>{r.count} ({pct}%)</span>
                </div>
                <div style={{ height: 5, background: C.surface2, borderRadius: 3, border: `1px solid ${C.border}` }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: C.red, borderRadius: 3, transition: "width 0.4s" }} />
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
    const d = await apiCall("/editorial/manual-article", apiKey, "POST", { ...form, imageThumbnail: form.imageThumbnail || undefined });
    if (d.success) {
      setSaved(true);
      setForm({ title: "", excerpt: "", aiSummary: "", category: "Intel", sourceUrl: "", sourceName: "", imageThumbnail: "" });
      setTimeout(() => setSaved(false), 3000);
    } else {
      setErr(d.error ?? d.detail ?? "Unknown error");
    }
    setSaving(false);
  };

  const field = (lbl, k, ph, multi) => (
    <div style={{ marginBottom: 16 }}>
      <Label>{lbl}</Label>
      {multi
        ? <textarea value={form[k]} onChange={e => upd(k, e.target.value)} placeholder={ph} rows={4} className="ed-input" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} />
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
          <select value={form.category} onChange={e => upd("category", e.target.value)} className="ed-input" style={{ padding: "9px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, cursor: "pointer" }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {field("Source URL *", "sourceUrl", "https://rockstarintel.com/…")}
        {field("Source Name *", "sourceName", "e.g. Rockstar Intel")}
        {field("Excerpt / Raw Text", "excerpt", "Paste original article text here…", true)}
        {field("AI Summary", "aiSummary", "Write a clean 2–3 sentence summary…", true)}
        {field("Image URL (optional)", "imageThumbnail", "https://cdn.example.com/image.jpg")}

        {err && (
          <div style={{ color: C.red, fontSize: 12, marginBottom: 16, padding: "10px 14px", background: C.redDim, borderRadius: 8, border: `1px solid ${C.red}33` }}>{err}</div>
        )}
        <Btn onClick={submit} disabled={saving} color={saved ? C.green : C.red} style={{ padding: "12px 32px", fontSize: 13 }}>
          {saving ? "Publishing…" : saved ? "✓ Published!" : "Publish Article →"}
        </Btn>
      </Card>
    </div>
  );
}
