// EditorialDesk.jsx — Dark-Mode Administrative Control Center
import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { apiCall } from "../components/editorial/api";
import { RefreshCw } from "lucide-react";

// Lazy load the decomposed panels to minimize bundle size & optimize main-thread responsiveness
const QueuePanel = lazy(() => import("../components/editorial/QueuePanel"));
const PublishedPanel = lazy(() => import("../components/editorial/PublishedPanel"));
const ScraperControlPanel = lazy(() => import("../components/editorial/ScraperControlPanel"));
const SourcesPanel = lazy(() => import("../components/editorial/SourcesPanel"));
const SystemConfigPanel = lazy(() => import("../components/editorial/SystemConfigPanel"));
const TimelinePanel = lazy(() => import("../components/editorial/TimelinePanel"));
const GroqUsagePanel = lazy(() => import("../components/editorial/GroqUsagePanel"));
const ManualEntryPanel = lazy(() => import("../components/editorial/ManualEntryPanel"));

const STORAGE_KEY = "lv_editorial_key";
const DEFAULT_KEY = "LEONIDA2026";

const DESK_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
  .ed-desk * { box-sizing: border-box; }
  .ed-desk { font-family: 'Inter', system-ui, sans-serif; }
  .ed-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
  .ed-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .ed-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 4px; }
  .ed-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 42, 109, 0.2); }
  
  .scanline {
    position: relative;
  }
  .scanline::before {
    content: " ";
    display: block;
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    z-index: 2;
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
    opacity: 0.15;
  }
  .vignette {
    box-shadow: inset 0 0 100px rgba(0,0,0,0.8);
  }
`;

const NAV_ITEMS = [
  { id: "queue",     label: "Review Queue",    icon: "⊞", badge: s => s?.pending ?? null },
  { id: "published", label: "Published",       icon: "✓", badge: s => s?.todayPublished ?? null },
  { id: "scraper",   label: "Scraper Control", icon: "⟳" },
  { id: "sources",   label: "News Feeds",      icon: "⊕" },
  { id: "site",      label: "Layout Controls", icon: "⚙" },
  { id: "timeline",  label: "Timeline Metrics", icon: "◷" },
  { id: "groq",      label: "Groq Console",    icon: "⚡" },
  { id: "manual",    label: "Manual Ingest",   icon: "✎" },
];

function LoginScreen({ onLogin }) {
  const [key, setKey] = useState("");
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!key.trim()) return;
    setLoading(true);
    try {
      const d = await apiCall("/editorial/stats", key);
      if (d.pending !== undefined || d.published !== undefined) {
        onLogin(key);
      } else {
        setErr(true);
        setTimeout(() => setErr(false), 2500);
      }
    } catch (_) {
      setErr(true);
      setTimeout(() => setErr(false), 2500);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center scanline vignette relative p-6">
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#ff2a6d]/5 via-transparent to-[#05d9e8]/5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-[400px] bg-[#121216]/90 border border-white/5 shadow-2xl rounded-2xl p-8 backdrop-blur-md">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Leonida Vice
          </span>
          <h1 className="font-editorial text-3xl font-black text-white mt-1.5 mb-2 leading-none">
            Editorial Desk
          </h1>
          <p className="text-xs text-zinc-400">
            Enter administrative credentials to access newsroom servers
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Editorial access key..."
            className="w-full bg-[#050505] border border-white/10 text-white rounded-lg px-4 py-3 text-sm text-center tracking-[0.15em] placeholder-zinc-600 focus:border-[#ff2a6d]/50 focus:outline-none transition-all"
          />

          {err && (
            <div className="text-xs text-[#ff2a6d] text-center font-semibold animate-pulse">
              Invalid credentials — authentication failed.
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-[#ff2a6d] hover:bg-[#ff2a6d]/90 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest border border-[#ff2a6d]/50 shadow-lg shadow-[#ff2a6d]/15 hover:shadow-[#ff2a6d]/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin text-white" />
            ) : (
              "Enter Command Center →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditorialDesk() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY);
  const [tab, setTab] = useState("queue");
  const [stats, setStats] = useState(null);
  const [groqUsage, setGroqUsage] = useState(null);

  const loadStats = useCallback(async () => {
    if (!apiKey) return;
    try {
      const [d, gu] = await Promise.all([
        apiCall("/editorial/stats", apiKey),
        apiCall("/editorial/groq-usage", apiKey).catch(() => null)
      ]);
      if (d.pending !== undefined) setStats(d);
      if (gu) setGroqUsage(gu);
    } catch (_) {}
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, apiKey);
    loadStats();
    const t = setInterval(loadStats, 30000);
    return () => clearInterval(t);
  }, [loadStats, apiKey]);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
  };

  if (!apiKey) {
    return (
      <>
        <style>{DESK_CSS}</style>
        <LoginScreen onLogin={setApiKey} />
      </>
    );
  }

  return (
    <>
      <style>{DESK_CSS}</style>
      <div className="ed-desk flex h-screen bg-[#050505] text-[#f9f9fa] overflow-hidden select-none">
        
        {/* Sleek Dark HSL Sidebar */}
        <div className="w-60 bg-[#121216] border-r border-white/5 flex flex-col flex-shrink-0">
          
          {/* Sidebar Logo Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <span className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#ff2a6d] to-[#ff7b00] flex items-center justify-center font-editorial text-lg text-white font-black shadow-lg shadow-[#ff2a6d]/10">
              LV
            </span>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
                Leonida Vice
              </span>
              <h2 className="font-editorial text-sm font-black text-white mt-0.5 leading-none">
                Editorial Control
              </h2>
            </div>
          </div>

          {/* Stats widgets Bento panels */}
          {stats && (
            <div className="p-4 border-b border-white/5 grid grid-cols-2 gap-2">
              {[
                { label: "Pending", value: stats.pending, color: "text-[#ffb300]" },
                { label: "Today", value: stats.todayPublished, color: "text-[#00c853]" },
                { label: "Published", value: stats.published, color: "text-zinc-400" },
                { label: "Rejected", value: stats.rejected, color: "text-zinc-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-[#1c1c22]/30 border border-white/5 rounded-xl p-3">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                    {label}
                  </span>
                  <span className={`text-xl font-bold font-display ${color}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Groq Token Budget Bar */}
          {groqUsage && (
            <div className="mx-4 my-2 p-3 bg-[#1c1c22]/30 border border-white/5 rounded-xl">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#05d9e8] animate-pulse" />
                  Groq Token Budget
                </span>
                <span className="text-[9px] font-display font-bold text-zinc-400">
                  {Math.round((groqUsage.tokens_used_today / groqUsage.daily_token_limit) * 100)}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#05d9e8] to-[#ff2a6d] transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (groqUsage.tokens_used_today / groqUsage.daily_token_limit) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-medium text-zinc-500 uppercase">
                <span>
                  {groqUsage.tokens_used_today.toLocaleString()} / {groqUsage.daily_token_limit.toLocaleString()} TPD
                </span>
                <span>
                  {groqUsage.requests_used_today} reqs
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-4 overflow-y-auto space-y-1.5 ed-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = tab === item.id;
              const badge = item.badge?.(stats);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? "rgba(255, 42, 109, 0.06)" : "transparent",
                    color: isActive ? "#f9f9fa" : "#a1a1aa",
                    borderLeft: isActive ? "3px solid #ff2a6d" : "3px solid transparent",
                  }}
                >
                  <span className="text-sm w-4 text-center">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {badge !== null && badge !== undefined && badge > 0 && (
                    <span className="bg-[#ff2a6d] text-white rounded-full text-[9px] font-black px-2 py-0.5 shadow-md shadow-[#ff2a6d]/20">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Sign Out Footer */}
          <div className="p-4 border-t border-white/5 space-y-2">
            <a
              href="/"
              className="flex justify-center items-center py-2 border border-white/5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/[0.02] transition-all duration-200"
            >
              ← Back to Live Site
            </a>
            <button
              onClick={logout}
              className="w-full py-2 bg-transparent border border-[#ff2a6d]/10 hover:border-[#ff2a6d]/30 text-zinc-500 hover:text-[#ff2a6d] rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dynamic Main Workspace Column */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header Strip */}
          <div className="px-6 py-4 bg-[#0A0A0C] border-b border-white/5 flex items-center justify-between flex-shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs">{NAV_ITEMS.find(n => n.id === tab)?.icon}</span>
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
                  {NAV_ITEMS.find(n => n.id === tab)?.label}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                {tab === "queue"     && `${stats?.pending ?? "—"} scraper drafts awaiting administrative review`}
                {tab === "published" && `${stats?.published ?? "—"} total approved publications · ${stats?.todayPublished ?? "—"} live today`}
                {tab === "scraper"   && "Monitor, configure discover limits, and manually trigger discovered runs"}
                {tab === "sources"   && "Enable or disable individual discovered news sources and networks"}
                {tab === "site"      && "Adjust home pins, breaking marquee updates, and layout rules"}
                {tab === "timeline"  && "Track daily publication and rejection telemetry checks"}
                {tab === "groq"      && "Audit live rate-limits, daily token budgets, and API headers from Groq Cloud"}
                {tab === "manual"    && "Bypass scraper discover and deploy a custom article instantly"}
              </p>
            </div>
            
            <button
              onClick={loadStats}
              className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-lg hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <RefreshCw size={12} />
              Reload Stats
            </button>
          </div>

          {/* Dynamic Component Panelling mount */}
          <div className="flex-1 overflow-hidden">
            <Suspense fallback={
              <div className="h-full flex items-center justify-center bg-[#050505] text-zinc-500 text-xs">
                <RefreshCw size={24} className="animate-spin text-[#ff2a6d] mb-3" />
                <span className="ml-2">Loading Command Panel...</span>
              </div>
            }>
              {tab === "queue" && <QueuePanel apiKey={apiKey} stats={stats} onStatsChange={loadStats} />}
              {tab !== "queue" && (
                <div className="h-full overflow-y-auto ed-scrollbar">
                  {tab === "published" && <PublishedPanel apiKey={apiKey} />}
                  {tab === "scraper"   && <ScraperControlPanel apiKey={apiKey} />}
                  {tab === "sources"   && <SourcesPanel apiKey={apiKey} />}
                  {tab === "site"      && <SystemConfigPanel apiKey={apiKey} />}
                  {tab === "timeline"  && <TimelinePanel apiKey={apiKey} />}
                  {tab === "groq"      && <GroqUsagePanel apiKey={apiKey} />}
                  {tab === "manual"    && <ManualEntryPanel apiKey={apiKey} />}
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
