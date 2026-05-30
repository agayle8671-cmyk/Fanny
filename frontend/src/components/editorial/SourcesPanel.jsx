import { useState, useEffect } from "react";
import { apiCall } from "./api";
import { Check, X, Rss, AlertTriangle, RefreshCw, ToggleLeft, ToggleRight } from "lucide-react";

export default function SourcesPanel({ apiKey }) {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiCall("/editorial/sources", apiKey);
      setSources(d.sources ?? []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const toggle = async (name) => {
    try {
      const d = await apiCall(`/editorial/sources/${name}/toggle`, apiKey, "POST");
      setSources((prev) =>
        prev.map((s) => (s.name === name ? { ...s, isActive: d.isActive } : s))
      );
    } catch (_) {}
  };

  const active = sources.filter((s) => s.isActive).length;

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Feeds Database
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            News Sources
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {active} of {sources.length} active feeds in discovery crawler rotation
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

      {/* List */}
      <div className="space-y-4">
        {sources.length === 0 && !loading && (
          <div className="text-center py-12 border border-white/5 bg-[#121216]/10 text-zinc-500 text-xs">
            No news sources configured in the database.
          </div>
        )}

        {sources.map((s) => {
          const isErrorProne = (s.failCount || 0) > 5;
          const statusCls = s.isActive
            ? "border-green-500/10 bg-[#121216]/30"
            : "border-white/5 bg-[#121216]/10 opacity-40";

          return (
            <div
              key={s.name}
              className={`p-5 rounded-xl border transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${statusCls}`}
            >
              <div className="flex-1 min-w-0">
                {/* Titles / Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="text-sm font-semibold text-white tracking-wide">{s.name}</span>
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] text-zinc-400 border border-white/10 px-2 py-0.5 rounded">
                    {s.type}
                  </span>
                  <span className="text-[8px] font-bold uppercase tracking-wider bg-white/[0.04] text-zinc-400 border border-white/10 px-2 py-0.5 rounded">
                    {s.category}
                  </span>
                </div>

                {/* Telemetry info */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
                  <span className="flex items-center gap-1 text-[#00c853]">
                    <Check size={12} strokeWidth={3} /> {s.successCount || 0} successes
                  </span>
                  <span className={`flex items-center gap-1 ${isErrorProne ? "text-[#ff2a6d]" : "text-zinc-500"}`}>
                    <X size={12} strokeWidth={3} /> {s.failCount || 0} failures
                  </span>
                  <span className="text-zinc-500">
                    Last crawl:{" "}
                    {s.lastScrapedAt
                      ? new Date(s.lastScrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                      : "Never"}
                  </span>
                  {s.lastError && (
                    <span className="text-[#ff2a6d] flex items-center gap-1 cursor-help" title={s.lastError}>
                      <AlertTriangle size={12} />
                      Crawl fail
                    </span>
                  )}
                </div>
              </div>

              {/* Toggle Switch Button */}
              <button
                onClick={() => toggle(s.name)}
                className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-lg border transition-all duration-300 flex-shrink-0 min-w-[100px] justify-center ${
                  s.isActive
                    ? "bg-[#00c853]/10 hover:bg-[#00c853]/20 border-[#00c853]/30 text-[#00c853]"
                    : "bg-white/[0.02] hover:bg-white/[0.05] border-white/10 text-zinc-400"
                }`}
              >
                {s.isActive ? (
                  <>
                    <ToggleRight size={16} />
                    Active
                  </>
                ) : (
                  <>
                    <ToggleLeft size={16} />
                    Inactive
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
