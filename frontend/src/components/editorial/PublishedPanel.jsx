import { useState, useEffect } from "react";
import { apiCall, CATEGORIES, PLACEHOLDER_IMAGE } from "./api";
import { Trash2, ShieldAlert, Star, ExternalLink, RefreshCw, Wrench } from "lucide-react";

export default function PublishedPanel({ apiKey }) {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [repairing, setRepairing] = useState(false);
  const [repairToast, setRepairToast] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const q = `search=${encodeURIComponent(search)}&category=${category}&limit=30`;
      const d = await apiCall(`/editorial/published?${q}`, apiKey);
      setArticles(d.articles ?? []);
      setTotal(d.total ?? 0);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [category]); // eslint-disable-line

  const unpublish = async (id) => {
    await apiCall(`/editorial/unpublish/${id}`, apiKey, "POST");
    load();
  };

  const hardDelete = async (id) => {
    await apiCall(`/editorial/article/${id}`, apiKey, "DELETE");
    setConfirmDelete(null);
    load();
  };

  const setHero = async (id) => {
    await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST");
    load();
  };

  const repairImages = async () => {
    setRepairing(true);
    setRepairToast("");
    try {
      await apiCall("/editorial/repair-images", apiKey, "POST");
      setRepairToast("✅ Repair sweep started — missing images being fixed in background.");
    } catch (e) {
      setRepairToast("❌ Repair failed: " + e.message);
    }
    setRepairing(false);
    setTimeout(() => setRepairToast(""), 6000);
  };

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Live Content
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            Published Articles
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {total} articles currently live on the front page and news sections
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={repairImages}
            disabled={repairing}
            title="Find and fix all published articles missing hero or body images"
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/[0.06] border border-amber-400/20 rounded-lg hover:bg-amber-400/[0.12] hover:border-amber-400/40 transition-all disabled:opacity-50"
          >
            <Wrench size={14} className={repairing ? "animate-pulse" : ""} />
            {repairing ? "Repairing…" : "Repair Images"}
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 bg-white/[0.02] border border-white/10 rounded-lg hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#ff2a6d]" : ""} />
            Refresh
          </button>
        </div>
      </div>
      {repairToast && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
          {repairToast}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, tags, or source..."
          onKeyDown={(e) => e.key === "Enter" && load()}
          className="flex-1 bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-sm text-[#f9f9fa] placeholder-zinc-500 rounded-lg px-4 py-2.5 transition-all duration-200"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-sm text-[#f9f9fa] rounded-lg px-4 py-2.5 transition-all duration-200 cursor-pointer"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={load}
          className="bg-[#ff2a6d] hover:bg-[#ff2a6d]/90 text-white border border-[#ff2a6d]/50 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200"
        >
          Search
        </button>
      </div>

      {/* Grid List */}
      <div className="space-y-4">
        {articles.length === 0 && !loading && (
          <div className="text-center py-16 border border-white/5 rounded-xl bg-[#121216]/20">
            <div className="text-zinc-500 text-3xl mb-3">📭</div>
            <h3 className="text-sm font-semibold text-zinc-400">No published articles found</h3>
            <p className="text-xs text-zinc-500 mt-1">Try adjusting your filters or publish new drafts from the Review Queue.</p>
          </div>
        )}

        {articles.map((a) => {
          const thumb = a.imageThumbnail || a.videoThumbnail || PLACEHOLDER_IMAGE;
          const liveUrl = a.slug ? `/news/${a.slug}` : a.sourceUrl;

          return (
            <div
              key={a.id}
              className="relative overflow-hidden rounded-xl border border-white/5 bg-[#121216]/30 hover:bg-[#1c1c22]/40 hover:border-white/10 transition-all duration-300 p-5 shadow-xl hover:shadow-[#ff2a6d]/5 flex flex-col md:flex-row gap-5"
            >
              {/* Thumbnail */}
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative flex-shrink-0 w-full md:w-32 h-24 rounded-lg overflow-hidden border border-white/5"
              >
                <img
                  src={thumb}
                  alt={a.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                  <ExternalLink size={16} />
                </div>
              </a>

              {/* Contents */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#ff2a6d] bg-[#ff2a6d]/10 px-2 py-0.5 rounded border border-[#ff2a6d]/20">
                    {a.category}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">{a.sourceName}</span>
                  {a.isFeatured && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#ff7b00] bg-[#ff7b00]/10 px-2 py-0.5 rounded border border-[#ff7b00]/20">
                      <Star size={10} fill="#ff7b00" /> Hero pinned
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-500 font-medium ml-auto">
                    {new Date(a.scrapedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                <a href={liveUrl} target="_blank" rel="noreferrer" className="block group">
                  <h3 className="text-base font-semibold text-white leading-snug group-hover:text-[#05d9e8] transition-colors mb-2">
                    {a.title}
                  </h3>
                </a>

                {a.aiSummary && (
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {a.aiSummary}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex md:flex-col gap-2 justify-end flex-shrink-0 min-w-[120px]">
                {!a.isFeatured && (
                  <button
                    onClick={() => setHero(a.id)}
                    className="flex items-center justify-center gap-1.5 w-full bg-transparent hover:bg-[#ff7b00]/10 text-[#ff7b00] border border-[#ff7b00]/20 hover:border-[#ff7b00]/50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  >
                    <Star size={12} /> Pin Hero
                  </button>
                )}
                <button
                  onClick={() => unpublish(a.id)}
                  className="flex items-center justify-center gap-1.5 w-full bg-transparent hover:bg-white/[0.03] text-zinc-400 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                >
                  Unpublish
                </button>

                {confirmDelete === a.id ? (
                  <button
                    onClick={() => hardDelete(a.id)}
                    className="flex items-center justify-center gap-1.5 w-full bg-[#ff2a6d] hover:bg-[#ff2a6d]/90 text-white border border-[#ff2a6d]/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
                  >
                    <ShieldAlert size={12} /> Confirm
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(a.id)}
                    className="flex items-center justify-center gap-1.5 w-full bg-transparent hover:bg-[#ff2a6d]/10 text-[#ff2a6d] border border-[#ff2a6d]/10 hover:border-[#ff2a6d]/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
