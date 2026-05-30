import { useState, useEffect } from "react";
import { apiCall } from "./api";
import { Star, Plus, Save, Trash, Search, RefreshCw, Megaphone } from "lucide-react";

export default function SystemConfigPanel({ apiKey }) {
  const [hero, setHero] = useState(null);
  const [tickerItems, setTickerItems] = useState([]);
  const [tickerSaved, setTickerSaved] = useState(false);
  const [heroSearch, setHeroSearch] = useState("");
  const [heroResults, setHeroResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tickerSaving, setTickerSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const hd = await apiCall("/editorial/hero", apiKey);
      setHero(hd.hero);
      const td = await apiCall("/editorial/ticker", apiKey);
      setTickerItems(td.items ?? []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []); // eslint-disable-line

  const searchHero = async () => {
    try {
      const d = await apiCall(`/editorial/published?search=${encodeURIComponent(heroSearch)}&limit=5`, apiKey);
      setHeroResults(d.articles ?? []);
    } catch (_) {}
  };

  const pinHero = async (id) => {
    try {
      const d = await apiCall(`/editorial/set-hero/${id}`, apiKey, "POST");
      if (d.success) {
        const hd = await apiCall("/editorial/hero", apiKey);
        setHero(hd.hero);
        setHeroResults([]);
        setHeroSearch("");
      }
    } catch (_) {}
  };

  const saveTicker = async () => {
    setTickerSaving(true);
    try {
      await apiCall("/editorial/ticker", apiKey, "PUT", { items: tickerItems });
      setTickerSaved(true);
      setTimeout(() => setTickerSaved(false), 2000);
    } catch (_) {}
    setTickerSaving(false);
  };

  const updateTicker = (i, val) =>
    setTickerItems((prev) => prev.map((x, idx) => (idx === i ? val : x)));

  const removeTicker = (i) =>
    setTickerItems((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="p-6 bg-[#050505] text-[#f9f9fa] min-h-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ff2a6d]">
            Configuration Bureau
          </span>
          <h2 className="font-editorial text-2xl md:text-3xl text-white mt-1">
            System & Layout Controls
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Configure pinned hero articles, update ticker updates, and align site configurations
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
        {/* Hero Pinnings Panel */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 mb-5 flex items-center gap-2">
            <Star size={16} fill="#ff7b00" className="text-[#ff7b00]" />
            Featured Hero Pinnings
          </h3>

          {hero ? (
            <div className="flex gap-4 items-center mb-6 p-4 bg-[#ff7b00]/10 border border-[#ff7b00]/20 rounded-xl relative overflow-hidden group">
              {hero.imageThumbnail && (
                <img
                  src={hero.imageThumbnail}
                  alt=""
                  className="w-20 h-14 object-cover rounded-lg border border-white/5 flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#ff7b00] block mb-1">
                  ⭐ Current Hero
                </span>
                <h4 className="text-sm font-semibold text-white truncate leading-snug">{hero.title}</h4>
                <p className="text-[10px] text-zinc-400 mt-1">
                  {hero.sourceName} · {new Date(hero.scrapedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 mb-6 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
              No hero article currently pinned — the latest published article is featured dynamically.
            </div>
          )}

          {/* Pin New Hero Search */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Search and Pin New Hero
            </label>
            <div className="flex gap-2">
              <input
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search live articles to feature..."
                onKeyDown={(e) => e.key === "Enter" && searchHero()}
                className="flex-1 bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] placeholder-zinc-500 rounded-lg px-4 py-2 transition-all duration-200"
              />
              <button
                onClick={searchHero}
                className="bg-transparent hover:bg-white/[0.04] text-zinc-300 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5"
              >
                <Search size={13} />
                Search
              </button>
            </div>

            {/* Results */}
            <div className="space-y-2">
              {heroResults.map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-lg transition-all"
                >
                  <span className="text-xs text-white truncate mr-4">{a.title}</span>
                  <button
                    onClick={() => pinHero(a.id)}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#ff7b00]/10 hover:bg-[#ff7b00]/20 text-[#ff7b00] border border-[#ff7b00]/20 px-3 py-1.5 rounded transition-all flex-shrink-0"
                  >
                    ⭐ Pin
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breaking News Ticker Panel */}
        <div className="rounded-xl border border-white/5 bg-[#121216]/30 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300 flex items-center gap-2">
              <Megaphone size={16} className="text-[#ff2a6d]" />
              Breaking Live Wire Ticker
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setTickerItems((prev) => [...prev, ""])}
                className="flex items-center gap-1 bg-transparent hover:bg-white/[0.04] border border-white/10 text-zinc-300 py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                <Plus size={12} /> Add Ticker
              </button>
              <button
                onClick={saveTicker}
                disabled={tickerSaving}
                className="flex items-center gap-1 bg-[#ff2a6d] hover:bg-[#ff2a6d]/90 border border-[#ff2a6d]/50 text-white py-1.5 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all min-w-[90px] justify-center"
              >
                <Save size={12} />
                {tickerSaving ? "Saving..." : tickerSaved ? "✓ Saved!" : "Save Ticker"}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 mb-4">
            Changes saved here populate the top red flashing "Live Wire" ticker across all public pages instantly.
          </p>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
            {tickerItems.length === 0 && (
              <div className="text-center py-6 text-zinc-600 text-xs italic">
                No breaking news items loaded. Add one above!
              </div>
            )}

            {tickerItems.map((item, i) => (
              <div key={i} className="flex gap-2 items-center group">
                <span className="text-[10px] text-zinc-500 font-bold w-5 text-right flex-shrink-0">
                  {i + 1}.
                </span>
                <input
                  value={item}
                  onChange={(e) => updateTicker(i, e.target.value)}
                  placeholder="Type breaking headline telemetry..."
                  className="flex-1 bg-[#121216] border border-white/5 focus:border-[#ff2a6d]/50 focus:outline-none text-xs text-[#f9f9fa] placeholder-zinc-600 rounded-lg px-4 py-2 transition-all"
                />
                <button
                  onClick={() => removeTicker(i)}
                  className="bg-transparent hover:bg-[#ff2a6d]/10 border border-white/5 hover:border-[#ff2a6d]/20 text-zinc-500 hover:text-[#ff2a6d] w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                >
                  <Trash size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
