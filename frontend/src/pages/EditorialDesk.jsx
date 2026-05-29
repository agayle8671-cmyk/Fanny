// EditorialDesk.jsx — direct port of old EditorialDesk.tsx (TypeScript stripped)
import { useState, useEffect, useCallback } from "react";
import { apiCall, PublishedPanel, ScraperPanel, SourcesPanel, SitePanel, TimelinePanel, ManualEntryPanel, REJECTION_REASONS } from "./EditorialPanels";
import { getFallbackImage } from "../lib/fallback-image";

const STORAGE_KEY = "lv_editorial_key";

const DESK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
  .ed-desk * { box-sizing: border-box; }
  .ed-desk { font-family: 'Inter', system-ui, sans-serif; }
  .ed-nav-item { transition: background 0.15s, color 0.15s; }
  .ed-nav-item:hover { background: rgba(196,18,48,0.08) !important; color: #C41230 !important; }
  .ed-nav-item.active { background: rgba(196,18,48,0.12) !important; color: #C41230 !important; border-left: 3px solid #C41230 !important; }
  .ed-card { transition: box-shadow 0.15s, border-color 0.15s; }
  .ed-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
  .ed-btn-approve { transition: all 0.15s; }
  .ed-btn-approve:hover:not(:disabled) { filter: brightness(1.1); }
  .ed-btn-reject:hover:not(:disabled) { background: rgba(196,18,48,0.06) !important; }
  .ed-btn-edit:hover:not(:disabled) { background: rgba(180,83,9,0.06) !important; }
  .ed-thumb-overlay { opacity: 0; transition: opacity 0.15s; }
  .ed-thumb:hover .ed-thumb-overlay { opacity: 1; }
  .ed-stat-card { transition: transform 0.15s, box-shadow 0.15s; }
  .ed-stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .ed-input:focus { outline: none; border-color: #C41230 !important; box-shadow: 0 0 0 3px rgba(196,18,48,0.1); }
  .ed-input { background: #ffffff !important; color: #1a1a1a !important; }
  @keyframes ed-spin { to { transform: rotate(360deg); } }
  .ed-spinner { animation: ed-spin 0.8s linear infinite; display: inline-block; }
  @keyframes ed-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  .ed-pulse { animation: ed-pulse 1.5s ease-in-out infinite; }
  .ed-scrollbar::-webkit-scrollbar { width: 4px; }
  .ed-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .ed-scrollbar::-webkit-scrollbar-thumb { background: #E2DDD6; border-radius: 4px; }
  .ed-desk select { background: #ffffff !important; color: #1a1a1a !important; }
  .ed-desk textarea { background: #ffffff !important; color: #1a1a1a !important; }
`;

// Design tokens — old site palette (light editorial theme)
const C = {
  bg:       "#f5f0e8",
  surface:  "#ffffff",
  surface2: "#f0ebe0",
  border:   "rgba(0,0,0,0.08)",
  border2:  "rgba(0,0,0,0.12)",
  text:     "#1a1a1a",
  text2:    "#4a4a4a",
  text3:    "#888888",
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

const CAT_COLORS = {
  Intel:          ["#1D4ED8", "rgba(59,130,246,0.15)"],
  Investigations: ["#7C3AED", "#F5F3FF"],
  "Vice City":    ["#0F766E", "#F0FDFA"],
  Vehicles:       ["#B45309", "rgba(245,166,35,0.15)"],
  Business:       ["#1A7A3C", "rgba(26,122,60,0.15)"],
  Counties:       ["#9D174D", "#FDF2F8"],
  Markets:        ["#0369A1", "#F0F9FF"],
};

function ScoreBadge({ score }) {
  if (score === null || score === undefined) return <span style={{ color: C.text3, fontSize: 11 }}>—</span>;
  const level = score >= 70 ? "high" : score >= 40 ? "med" : "low";
  const [color, bg] = level === "high" ? [C.green, C.greenDim] : level === "med" ? [C.amber, C.amberDim] : [C.redText, C.redDim];
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}33`, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 9px", letterSpacing: "0.04em", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {level === "high" ? "🔥" : level === "med" ? "◈" : "○"} {score}
    </span>
  );
}

function CatPill({ cat }) {
  const [color, bg] = CAT_COLORS[cat] ?? [C.text2, C.surface2];
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}22`, borderRadius: 4, fontSize: 9, fontWeight: 700, padding: "2px 7px", letterSpacing: "0.1em", textTransform: "uppercase", display: "inline-flex", alignItems: "center" }}>
      {cat}
    </span>
  );
}

function RejectModal({ articleId, apiKey, onClose, onRejected }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const confirm = async () => {
    setSaving(true);
    await apiCall(`/editorial/reject/${articleId}`, apiKey, "POST", { reason: reason || undefined });
    setSaving(false); onRejected(); onClose();
  };
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border2}`, borderRadius: 16, padding: 28, width: 420, boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.redDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.red }}>✕</div>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Reject Article</div>
            <div style={{ color: C.text3, fontSize: 12 }}>Select a reason to track patterns</div>
          </div>
        </div>
        <div style={{ height: 1, background: C.border, margin: "16px 0" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
          {REJECTION_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)} style={{ background: reason === r ? C.redDim : "transparent", border: `1px solid ${reason === r ? C.red : C.border}`, color: reason === r ? C.red : C.text2, padding: "9px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: reason === r ? 600 : 400, transition: "all 0.15s" }}>{r}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.text2, padding: "9px 20px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Cancel</button>
          <button onClick={confirm} disabled={saving} style={{ background: C.red, border: "none", color: "#fff", padding: "9px 22px", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Rejecting…" : "Confirm Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, apiKey, onAction, focused, onSelect, onReject }) {
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [reprocessing, setReprocessing] = useState(false);
  const thumb = article.imageThumbnail || article.videoThumbnail;

  const approve = async (e) => {
    e.stopPropagation(); setApproving(true); setLoading(true);
    try { await apiCall(`/editorial/approve/${article.id}`, apiKey, "POST"); } catch (_) {}
    setApproving(false); setLoading(false); onAction();
  };
  const reprocess = async (e) => {
    e.stopPropagation(); setReprocessing(true);
    try { await apiCall(`/editorial/reprocess/${article.id}`, apiKey, "POST"); } catch (_) {}
    setReprocessing(false); onAction();
  };

  return (
    <div className="ed-card" onClick={onSelect} style={{
      display: "flex", gap: 16, background: focused ? C.blueDim : C.surface,
      border: `1px solid ${focused ? C.blue : C.border}`,
      borderRadius: 12, padding: 16, marginBottom: 10, cursor: "pointer",
      opacity: loading ? 0.6 : 1,
      boxShadow: focused ? `0 0 0 3px ${C.blue}22` : "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <a href={article.slug ? `/news/${article.slug}` : article.sourceUrl} target="_blank" rel="noreferrer"
        onClick={e => e.stopPropagation()} className="ed-thumb"
        style={{ display: "block", width: 96, height: 66, flexShrink: 0, borderRadius: 8, overflow: "hidden", position: "relative" }}>
        <img src={thumb || getFallbackImage(article.category, article.id)} alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.src = getFallbackImage(article.category, article.id); }} />
        <div className="ed-thumb-overlay" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20 }}>⇗</div>
      </a>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 7, flexWrap: "wrap" }}>
          <CatPill cat={article.category} />
          <span style={{ color: C.text3, fontSize: 11, fontWeight: 500 }}>{article.sourceName}</span>
          <span style={{ color: C.text3, fontSize: 11, marginLeft: "auto" }}>
            {new Date(article.scrapedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <p style={{ color: C.text, fontSize: 13, fontWeight: 600, lineHeight: 1.45, marginBottom: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {article.title}
        </p>
        {article.aiSummary
          ? <p style={{ color: C.text2, fontSize: 12, lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", marginBottom: 8 }}>{article.aiSummary}</p>
          : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ color: C.text3, fontSize: 12, fontStyle: "italic" }}>No AI summary yet</span>
              <button onClick={reprocess} disabled={reprocessing} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: reprocessing ? C.text3 : C.text2, padding: "2px 9px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 600 }}>
                {reprocessing ? <span className="ed-spinner">↻</span> : "↻ Re-AI"}
              </button>
            </div>
          )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <ScoreBadge score={article.newsValueScore} />
          <a href={article.sourceUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: C.text3, fontSize: 11, textDecoration: "none", fontWeight: 500 }}>↗ Source</a>
          {article.slug && <a href={`/news/${article.slug}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ color: C.blue, fontSize: 11, textDecoration: "none", fontWeight: 600 }}>⇗ Live</a>}
          {article.aiTags?.slice(0, 3).map(tag => (
            <span key={tag} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text3, fontSize: 10, padding: "1px 7px", borderRadius: 20 }}>{tag}</span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0, minWidth: 100 }}>
        <button disabled={loading} onClick={approve} className="ed-btn-approve" style={{
          background: approving ? C.greenDim : C.green, border: `1px solid ${C.green}`,
          color: approving ? C.green : "#fff", padding: "8px 0", borderRadius: 8,
          cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, width: "100%",
        }}>
          {approving ? <span className="ed-pulse">⏳ AI…</span> : "✓ Approve"}
        </button>
        <button disabled={loading} onClick={e => { e.stopPropagation(); onSelect(); }} className="ed-btn-edit" style={{
          background: "transparent", border: `1px solid ${C.border2}`, color: C.amber,
          padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, width: "100%",
        }}>✎ Edit</button>
        <button disabled={loading} onClick={e => { e.stopPropagation(); onReject(); }} className="ed-btn-reject" style={{
          background: "transparent", border: `1px solid ${C.border}`, color: C.redText,
          padding: "8px 0", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, width: "100%",
        }}>✕ Reject</button>
      </div>
    </div>
  );
}

function EditDrawer({ article, apiKey, onClose, onSaved }) {
  const [summary, setSummary] = useState(article.aiSummary ?? "");
  const [category, setCategory] = useState(article.category);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

  const save = async () => {
    setSaving(true);
    await apiCall(`/editorial/article/${article.id}`, apiKey, "PATCH", { category, aiSummary: summary });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); onSaved(); onClose(); }, 1200);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1500, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }} />
      <div style={{ width: 480, background: C.surface, borderLeft: `1px solid ${C.border2}`, display: "flex", flexDirection: "column", boxShadow: "-24px 0 64px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.red, textTransform: "uppercase", marginBottom: 2 }}>Edit Article</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{article.title.slice(0, 60)}{article.title.length > 60 ? "…" : ""}</div>
          </div>
          <button onClick={onClose} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text2, width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 24 }} className="ed-scrollbar">
          {(article.imageThumbnail || article.videoThumbnail) && (
            <img src={article.imageThumbnail || article.videoThumbnail} alt="" style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10, marginBottom: 20, border: `1px solid ${C.border}` }} />
          )}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.text3, textTransform: "uppercase", marginBottom: 6 }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="ed-input" style={{ width: "100%", padding: "9px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, cursor: "pointer" }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: C.text3, textTransform: "uppercase", marginBottom: 6 }}>AI Summary</label>
            <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={5} className="ed-input" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 13, color: C.text, background: C.surface, resize: "vertical", lineHeight: 1.6, fontFamily: "inherit" }} placeholder="Write a 2–3 sentence editorial summary…" />
          </div>
          <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.text3, textTransform: "uppercase", marginBottom: 6 }}>Source</div>
            <a href={article.sourceUrl} target="_blank" rel="noreferrer" style={{ color: C.blue, fontSize: 12, textDecoration: "none", wordBreak: "break-all" }}>{article.sourceUrl}</a>
          </div>
        </div>

        <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border2}`, color: C.text2, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 2, background: saved ? C.green : C.red, border: "none", color: "#fff", padding: "10px 0", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "background 0.2s" }}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}

function QueuePanel({ apiKey, stats, onStatsChange }) {
  const [articles, setArticles] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [catFilter, setCatFilter] = useState("all");
  const [focusedId, setFocusedId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = `status=${statusFilter}&category=${catFilter}&limit=50`;
      const d = await apiCall(`/editorial/queue?${q}`, apiKey);
      setArticles(d.articles ?? []);
      setTotal(d.total ?? 0);
    } catch (_) {}
    setLoading(false);
  }, [apiKey, statusFilter, catFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleSelect = (id) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const selectAll = () => setSelected(new Set(articles.map(a => a.id)));
  const clearSelect = () => setSelected(new Set());

  const bulkApprove = async () => {
    setBulkWorking(true);
    try { await apiCall("/editorial/bulk-approve", apiKey, "POST", { ids: Array.from(selected) }); } catch (_) {}
    setBulkWorking(false); setBulkMode(false); clearSelect(); load(); onStatsChange();
  };
  const bulkReject = async () => {
    setBulkWorking(true);
    try { await apiCall("/editorial/bulk-reject", apiKey, "POST", { ids: Array.from(selected) }); } catch (_) {}
    setBulkWorking(false); setBulkMode(false); clearSelect(); load(); onStatsChange();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "16px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", background: C.surface }}>
        <div style={{ display: "flex", background: C.surface2, borderRadius: 8, padding: 3, gap: 2 }}>
          {["pending", "rejected"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setSelected(new Set()); }} style={{ padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: statusFilter === s ? C.surface : "transparent", color: statusFilter === s ? C.text : C.text3, boxShadow: statusFilter === s ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s", textTransform: "capitalize" }}>
              {s} {s === "pending" && stats ? <span style={{ background: C.red, color: "#fff", borderRadius: 20, fontSize: 10, padding: "1px 6px", marginLeft: 4 }}>{stats.pending}</span> : null}
            </button>
          ))}
        </div>

        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="ed-input" style={{ padding: "7px 10px", border: `1px solid ${C.border2}`, borderRadius: 8, fontSize: 12, color: C.text, background: C.surface, cursor: "pointer" }}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div style={{ flex: 1 }} />

        <button onClick={() => { setBulkMode(b => !b); clearSelect(); }} style={{ background: bulkMode ? C.surface2 : "transparent", border: `1px solid ${bulkMode ? C.border2 : C.border}`, color: bulkMode ? C.text : C.text2, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          {bulkMode ? "✕ Cancel Bulk" : "⊞ Bulk Select"}
        </button>

        {bulkMode && selected.size > 0 && (
          <>
            <button onClick={bulkApprove} disabled={bulkWorking} style={{ background: C.green, border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              {bulkWorking ? "Working…" : `✓ Approve ${selected.size}`}
            </button>
            <button onClick={bulkReject} disabled={bulkWorking} style={{ background: "transparent", border: `1px solid ${C.red}`, color: C.red, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
              ✕ Reject {selected.size}
            </button>
          </>
        )}

        {bulkMode && (
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={selectAll} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text2, padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>All</button>
            <button onClick={clearSelect} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text2, padding: "7px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11 }}>None</button>
          </div>
        )}
      </div>

      <div style={{ padding: "10px 24px", background: C.surface2, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: C.text2, fontWeight: 500 }}>{total} articles</span>
        {loading && <span className="ed-spinner" style={{ color: C.text3, fontSize: 14 }}>↻</span>}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px" }} className="ed-scrollbar">
        {!loading && articles.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ color: C.text2, fontSize: 15, fontWeight: 600 }}>Queue is clear</div>
            <div style={{ color: C.text3, fontSize: 13, marginTop: 4 }}>No {statusFilter} articles</div>
          </div>
        )}
        {articles.map(a => (
          <div key={a.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            {bulkMode && (
              <div onClick={() => toggleSelect(a.id)} style={{ paddingTop: 18, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected.has(a.id) ? C.red : C.border2}`, background: selected.has(a.id) ? C.red : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, transition: "all 0.15s" }}>
                  {selected.has(a.id) ? "✓" : ""}
                </div>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <ArticleCard
                article={a} apiKey={apiKey}
                onAction={() => { load(); onStatsChange(); }}
                focused={focusedId === a.id}
                onSelect={() => setFocusedId(focusedId === a.id ? null : a.id)}
                onReject={() => setRejectTarget(a.id)}
              />
              {focusedId === a.id && (
                <div style={{ background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginTop: -4, marginBottom: 10 }}>
                  {a.excerpt && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: C.text3, textTransform: "uppercase", marginBottom: 6 }}>Original Excerpt</div>
                      <p style={{ color: C.text2, fontSize: 12, lineHeight: 1.65 }}>{a.excerpt.slice(0, 400)}{a.excerpt.length > 400 ? "…" : ""}</p>
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setEditTarget(a)} style={{ background: C.surface, border: `1px solid ${C.border2}`, color: C.text2, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✎ Edit Summary & Category</button>
                    <a href={a.sourceUrl} target="_blank" rel="noreferrer" style={{ background: C.surface, border: `1px solid ${C.border2}`, color: C.blue, padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>↗ View Source</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {rejectTarget !== null && (
        <RejectModal articleId={rejectTarget} apiKey={apiKey} onClose={() => setRejectTarget(null)} onRejected={() => { load(); onStatsChange(); }} />
      )}
      {editTarget !== null && (
        <EditDrawer article={editTarget} apiKey={apiKey} onClose={() => setEditTarget(null)} onSaved={() => { load(); onStatsChange(); }} />
      )}
    </div>
  );
}

const NAV_ITEMS = [
  { id: "queue",     label: "Review Queue",    icon: "⊞", badge: s => s?.pending ?? null },
  { id: "published", label: "Published",       icon: "✓", badge: s => s?.todayPublished ?? null },
  { id: "scraper",   label: "Scraper",         icon: "⟳" },
  { id: "sources",   label: "Sources",         icon: "⊕" },
  { id: "site",      label: "Site Controls",   icon: "⚙" },
  { id: "timeline",  label: "Timeline",        icon: "◷" },
  { id: "manual",    label: "Manual Entry",    icon: "✎" },
];

function LoginScreen({ onLogin }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState(false);
  const submit = async () => {
    try {
      const d = await apiCall("/editorial/stats", key);
      if (d.pending !== undefined || d.published !== undefined) { onLogin(key); }
      else { setErr(true); setTimeout(() => setErr(false), 2000); }
    } catch (_) { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{ minHeight: "100vh", background: C.sidebar, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 48, width: 380, boxShadow: "0 40px 100px rgba(0,0,0,0.4)", textAlign: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: C.red, textTransform: "uppercase", marginBottom: 8 }}>Leonida Vice</div>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 4 }}>Editorial Desk</div>
        <div style={{ color: C.text3, fontSize: 13, marginBottom: 32 }}>Enter your editorial key to continue</div>
        <input
          type="password" value={key} onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Editorial key…"
          className="ed-input"
          style={{ width: "100%", padding: "12px 16px", border: `1px solid ${err ? C.red : C.border2}`, borderRadius: 10, fontSize: 14, color: C.text, background: C.surface, marginBottom: 12, textAlign: "center", letterSpacing: "0.1em" }}
        />
        {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>Invalid key — try again</div>}
        <button onClick={submit} style={{ width: "100%", background: C.red, border: "none", color: "#fff", padding: "13px 0", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em" }}>
          Enter Desk →
        </button>
      </div>
    </div>
  );
}

const DEFAULT_KEY = "LEONIDA2026";

export default function EditorialDesk() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY);
  const [tab, setTab] = useState("queue");
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(async () => {
    if (!apiKey) return;
    try {
      const d = await apiCall("/editorial/stats", apiKey);
      if (d.pending !== undefined) setStats(d);
    } catch (_) {}
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, apiKey);
    loadStats();
    const t = setInterval(loadStats, 30000);
    return () => clearInterval(t);
  }, [loadStats]);

  const logout = () => { localStorage.removeItem(STORAGE_KEY); setApiKey(DEFAULT_KEY); };

  return (
    <>
      <style>{DESK_CSS}</style>
      <div className="ed-desk" style={{ display: "flex", height: "100vh", background: C.bg, overflow: "hidden" }}>

        {/* Sidebar */}
        <div style={{ width: 220, background: C.sidebar, display: "flex", flexDirection: "column", flexShrink: 0, borderRight: "1px solid #2a2a2a" }}>
          <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #2a2a2a" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>Leonida Vice</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 900, color: C.bg, lineHeight: 1.2 }}>Editorial<br />Command</div>
          </div>

          {stats && (
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #2a2a2a" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { label: "Pending", value: stats.pending, color: "#FFB300" },
                  { label: "Today", value: stats.todayPublished, color: "#00C853" },
                  { label: "Published", value: stats.published, color: "#888" },
                  { label: "Rejected", value: stats.rejected, color: "#555" },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: "#111", borderRadius: 8, padding: "8px 10px" }}>
                    <div style={{ fontSize: 9, color: "#555", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color, fontFamily: "'Playfair Display', serif" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }} className="ed-scrollbar">
            {NAV_ITEMS.map(item => {
              const badge = item.badge?.(stats);
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={`ed-nav-item${tab === item.id ? " active" : ""}`} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  background: "transparent", border: "none", borderLeft: "3px solid transparent",
                  color: tab === item.id ? C.red : "#888", cursor: "pointer", borderRadius: "0 8px 8px 0",
                  fontSize: 13, fontWeight: tab === item.id ? 700 : 500, textAlign: "left", marginBottom: 2,
                }}>
                  <span style={{ fontSize: 15, width: 20, textAlign: "center" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {badge !== null && badge !== undefined && badge > 0 && (
                    <span style={{ background: C.red, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px", minWidth: 20, textAlign: "center" }}>{badge}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "14px 20px", borderTop: "1px solid #2a2a2a" }}>
            <a href="/" style={{ display: "block", color: "#555", fontSize: 11, textDecoration: "none", marginBottom: 8, fontWeight: 500 }}>← Back to Site</a>
            <button onClick={logout} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#555", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 11, width: "100%", fontWeight: 500 }}>Sign Out</button>
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 28px", background: C.surface, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: C.red, textTransform: "uppercase", marginBottom: 2 }}>
                {NAV_ITEMS.find(n => n.id === tab)?.icon} {NAV_ITEMS.find(n => n.id === tab)?.label}
              </div>
              <div style={{ fontSize: 12, color: C.text3 }}>
                {tab === "queue"     && `${stats?.pending ?? "—"} articles awaiting review`}
                {tab === "published" && `${stats?.published ?? "—"} total published · ${stats?.todayPublished ?? "—"} today`}
                {tab === "scraper"   && "Monitor and trigger the news scraper"}
                {tab === "sources"   && "Enable or disable individual news sources"}
                {tab === "site"      && "Hero pin, breaking ticker, site-wide settings"}
                {tab === "timeline"  && "7-day publishing activity and rejection patterns"}
                {tab === "manual"    && "Publish a custom article directly to the site"}
              </div>
            </div>
            <button onClick={loadStats} style={{ background: C.surface2, border: `1px solid ${C.border}`, color: C.text2, padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>↻ Refresh</button>
          </div>

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {tab === "queue"     && <QueuePanel apiKey={apiKey} stats={stats} onStatsChange={loadStats} />}
            {tab === "published" && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><PublishedPanel apiKey={apiKey} /></div>}
            {tab === "scraper"   && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><ScraperPanel apiKey={apiKey} /></div>}
            {tab === "sources"   && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><SourcesPanel apiKey={apiKey} /></div>}
            {tab === "site"      && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><SitePanel apiKey={apiKey} /></div>}
            {tab === "timeline"  && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><TimelinePanel apiKey={apiKey} /></div>}
            {tab === "manual"    && <div style={{ flex: 1, overflowY: "auto" }} className="ed-scrollbar"><ManualEntryPanel apiKey={apiKey} /></div>}
          </div>
        </div>
      </div>
    </>
  );
}
