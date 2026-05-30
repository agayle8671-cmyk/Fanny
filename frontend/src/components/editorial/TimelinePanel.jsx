import { useState, useEffect } from "react";
import { apiCall } from "./api";
import { Calendar, AlertTriangle, RefreshCw, BarChart2, PieChart } from "lucide-react";

export default function TimelinePanel({ apiKey }) {
  const [timeline, setTimeline] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const d = await apiCall("/editorial/timeline", apiKey);
      setTimeline(d.timeline ?? []);
      setReasons(d.reasonBreakdown ?? []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const maxPub = Math.max(...timeline.map((d) => Number(d.published)), 1);
  const totalRejections = reasons.reduce((s, x) => s + Number(x.count), 0);

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Analytics Room
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            Publishing Timeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Evaluate pipeline throughput, review daily ratios, and audit tracked rejection patterns
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day-by-Day Activity */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 mb-6 flex items-center gap-2">
            <BarChart2 size={16} className="text-[#00c853]" />
            7-Day Ingestion & Publishing Activity
          </h3>

          {timeline.length === 0 && !loading && (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No historical timeline activity logged yet.
            </div>
          )}

          <div className="space-y-5">
            {timeline.map((d) => {
              const pubPercent = (Number(d.published) / maxPub) * 100;
              return (
                <div key={d.day} className="group">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-white">
                      {new Date(d.day).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                    <div className="flex items-center gap-3.5 font-bold">
                      <span className="text-[#00c853]">+{d.published} published</span>
                      <span className="text-[#ff2a6d]">✕ {d.rejected} rejected</span>
                    </div>
                  </div>
                  
                  {/* Visual Bar chart ratio indicator */}
                  <div className="relative h-2.5 w-full bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#00c853] rounded-full group-hover:brightness-110 transition-all duration-500"
                      style={{ width: `${pubPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rejection Reasons */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 mb-6 flex items-center gap-2">
            <PieChart size={16} className="text-[#ff2a6d]" />
            Rejection Reason Breakdown (30-Day Window)
          </h3>

          {reasons.length === 0 && !loading && (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No tracked content rejections logged yet.
            </div>
          )}

          <div className="space-y-5">
            {reasons.map((r) => {
              const pct = totalRejections > 0 ? Math.round((Number(r.count) / totalRejections) * 100) : 0;
              return (
                <div key={r.rejection_reason} className="group">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="font-semibold text-white">{r.rejection_reason}</span>
                    <span className="text-[#ff2a6d] font-bold">
                      {r.count} hits ({pct}%)
                    </span>
                  </div>

                  {/* Rejection progress bar */}
                  <div className="relative h-2 w-full bg-white/[0.03] border border-white/5 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-[#ff2a6d] rounded-full group-hover:brightness-110 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
