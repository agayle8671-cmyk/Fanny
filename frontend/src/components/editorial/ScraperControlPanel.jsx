import { useState, useEffect } from "react";
import { apiCall } from "./api";
import { Play, RefreshCw, Activity, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

export default function ScraperControlPanel({ apiKey }) {
  const [status, setStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiCall("/editorial/scraper/status", apiKey);
      setStatus(d);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []); // eslint-disable-line

  const trigger = async () => {
    setTriggering(true);
    try {
      await apiCall("/editorial/scraper/trigger", apiKey, "POST");
    } catch (_) {}
    setTimeout(() => {
      load();
      setTriggering(false);
    }, 2000);
  };

  const isRunning = status?.isRunning;
  const lastRun = status?.recentRuns?.[0] ?? null;
  const statusColor = isRunning ? "#ffb300" : lastRun?.status === "failed" ? "#ff2a6d" : "#00c853";
  const shadowColor = isRunning ? "rgba(255,179,0,0.2)" : lastRun?.status === "failed" ? "rgba(255,42,109,0.2)" : "rgba(0,200,83,0.2)";
  const statusLabel = isRunning ? "RUNNING" : lastRun?.status?.toUpperCase() ?? "IDLE";

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Ingestion Pipeline
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            Scraper Control Room
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor RSS feeds, configure quotas, and manually trigger content discovery runs
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/10 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#ff2a6d]" : ""} />
          Refresh
        </button>
      </div>

      {/* Main Status Bento Box */}
      <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {/* Pulsing Status Dot */}
            <div className="relative flex h-5 w-5">
              {isRunning && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: statusColor }} />
              )}
              <span className="relative inline-flex rounded-full h-5 w-5 shadow-lg" style={{ backgroundColor: statusColor, boxShadow: `0 0 14px ${shadowColor}` }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-editorial text-2xl font-black tracking-wide" style={{ color: statusColor }}>
                  {statusLabel}
                </span>
                {isRunning && <span className="text-xs text-zinc-400 animate-pulse">(Ingesting feeds...)</span>}
              </div>
              {status?.nextRunIn && status.nextRunIn !== "Not scheduled" && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1.5">
                  <Calendar size={13} className="text-zinc-500" />
                  Next automated discovery run in <span className="text-white font-semibold">{status.nextRunIn}</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={trigger}
            disabled={triggering || !!isRunning}
            className="flex items-center gap-2 text-white font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg border shadow-lg transition-all duration-300 w-full md:w-auto justify-center"
            style={{
              backgroundColor: isRunning ? "rgba(255,255,255,0.03)" : "#00c853",
              borderColor: isRunning ? "rgba(255,255,255,0.08)" : "#00c853",
              boxShadow: isRunning ? "none" : "0 8px 24px rgba(0,200,83,0.15)",
              cursor: isRunning || triggering ? "not-allowed" : "pointer"
            }}
          >
            {isRunning ? (
              <>
                <Activity size={14} className="animate-pulse" />
                Pipeline Active
              </>
            ) : (
              <>
                <Play size={14} fill="white" />
                Run Discovery Now
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Telemetry Grid */}
        {lastRun && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
            {[
              { label: "Last Checked Run", value: new Date(lastRun.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), desc: "Time of last cycle", icon: <Calendar size={14} className="text-zinc-400" /> },
              { label: "Articles Discovered", value: `+${lastRun.articlesNew ?? 0}`, desc: "Ingested under cap", icon: <CheckCircle size={14} className="text-[#00c853]" /> },
              { label: "Sources Ok", value: String(lastRun.sourcesProcessed ?? 0), desc: "Feeds online", icon: <CheckCircle size={14} className="text-zinc-400" /> },
              { label: "Failed Feeds", value: String(lastRun.sourcesFailed ?? 0), desc: "Network timeout", icon: <AlertTriangle size={14} className={lastRun.sourcesFailed > 0 ? "text-[#ff2a6d]" : "text-zinc-400"} />, valueColor: lastRun.sourcesFailed > 0 ? "text-[#ff2a6d]" : "text-white" }
            ].map(({ label, value, desc, icon, valueColor }) => (
              <div key={label} className="bg-[#1c1c22]/20 border border-white/5 rounded-xl p-4 transition-all hover:bg-[#1c1c22]/40">
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</span>
                  {icon}
                </div>
                <div className={`text-xl font-bold ${valueColor || "text-white"} font-display`}>{value}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History List */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
          <Activity size={14} className="text-[#ff2a6d]" />
          Chronological Run History
        </h3>

        <div className="space-y-3">
          {status?.recentRuns?.length === 0 && (
            <div className="text-center py-10 border border-white/5 rounded-xl bg-[#121216]/10 text-zinc-500 text-xs">
              No historical pipeline run logs found.
            </div>
          )}

          {status?.recentRuns?.map((r, i) => {
            const isSuccess = r.status === "completed";
            const isRunActive = r.status === "running";
            const borderCls = isSuccess ? "border-green-500/10 hover:border-green-500/20" : isRunActive ? "border-amber-500/10 hover:border-amber-500/20" : "border-red-500/10 hover:border-red-500/20";
            const bgBadge = isSuccess ? "bg-[#00c853]/10 text-[#00c853] border-[#00c853]/20" : isRunActive ? "bg-[#ffb300]/10 text-[#ffb300] border-[#ffb300]/20" : "bg-[#ff2a6d]/10 text-[#ff2a6d] border-[#ff2a6d]/20";

            return (
              <div
                key={r.runId || i}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border bg-[#121216]/10 hover:bg-[#121216]/30 rounded-xl transition-all duration-200 ${borderCls}`}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${bgBadge}`}>
                    {r.status}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {new Date(r.startedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>

                <div className="flex items-center gap-5 text-xs font-semibold">
                  <span className="text-[#00c853]">+{r.articlesNew ?? 0} discovered</span>
                  <span className="text-zinc-400">{r.sourcesProcessed ?? 0} processed</span>
                  {(r.sourcesFailed ?? 0) > 0 && <span className="text-[#ff2a6d]">{r.sourcesFailed} failed</span>}
                  {r.errorMsg && (
                    <span className="text-[#ff2a6d] flex items-center gap-1 cursor-help" title={r.errorMsg}>
                      <AlertTriangle size={12} />
                      Error log
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
