import { useEffect, useState } from "react";
import { ExternalLink, Flame } from "lucide-react";
import { api, timeAgo, fallbackThumb } from "../lib/api";

const categoryFilters = ["All", "Leaks", "Tech", "Story", "Trailers", "World", "Markets"];

const Intel = () => {
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState("All");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    setItems(null);
    const params = filter === "All" ? { limit: 60 } : { limit: 60, category: filter };
    api.listArticles(params).then((res) => {
      if (!alive) return;
      setItems(res?.items || []);
      setTotal(res?.total || 0);
    });
    return () => {
      alive = false;
    };
  }, [filter]);

  return (
    <div data-testid="intel-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] mb-4 font-semibold">
            The Newswire
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            Live Intel
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Real-time intelligence aggregated from Rockstar Newswire, Reddit r/GTA6,
            IGN, GameSpot, Eurogamer, PC Gamer, VGC and more — triaged for news
            value, summarized for speed.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8" data-testid="intel-filter-bar">
          {categoryFilters.map((c) => (
            <button
              key={c}
              data-testid={`intel-filter-${c.toLowerCase()}`}
              onClick={() => setFilter(c)}
              className={`text-[11px] uppercase tracking-[0.25em] px-4 py-2 rounded-full border transition-all duration-200 ${
                filter === c
                  ? "bg-[#05D9E8] border-[#05D9E8] text-black"
                  : "border-white/15 text-zinc-300 hover:border-white/40 hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
          {items !== null && (
            <span className="ml-auto self-center text-[10px] uppercase tracking-[0.3em] text-zinc-500">
              {total.toLocaleString()} reports filed
            </span>
          )}
        </div>

        {items === null && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[16/10] rounded-lg bg-white/[0.03] border border-white/5 animate-pulse"
              />
            ))}
          </div>
        )}

        {items !== null && items.length === 0 && (
          <div
            data-testid="intel-empty"
            className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center mb-24"
          >
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#05D9E8] mb-4 font-semibold">
              Awaiting Transmission
            </p>
            <h2 className="font-display text-3xl md:text-4xl uppercase text-white mb-3">
              The Wire Is Quiet
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto leading-relaxed">
              Your scraper hasn't filed any reports yet for this category. Editorial
              long-form pieces are available on the{" "}
              <a href="/news" className="text-white underline underline-offset-4">
                Newsroom
              </a>
              .
            </p>
            <pre className="mt-8 text-left text-[11px] text-zinc-500 bg-black/40 border border-white/10 rounded-lg p-4 max-w-xl mx-auto overflow-x-auto">
              {`POST /api/articles/ingest
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json

{ "articles": [{ slug, title, sourceName, ... }] }`}
            </pre>
          </div>
        )}

        {items !== null && items.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
            {items.map((it, i) => {
              const thumb = it.imageThumbnail || it.videoThumbnail || fallbackThumb(i);
              const link = it.url || it.sourceUrl || "#";
              const isHot = (it.newsValueScore || 0) >= 70;
              return (
                <a
                  key={it.slug || i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid={`intel-card-${it.slug}`}
                  className="group block rounded-lg overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={thumb}
                      alt={it.title}
                      onError={(e) => {
                        e.currentTarget.src = fallbackThumb(i + 1);
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 hero-overlay" />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-white bg-black/65 px-2 py-1 rounded-sm">
                        {it.sourceName || "Newswire"}
                      </span>
                      {isHot && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-white bg-[#FF2A6D] px-2 py-1 rounded-sm font-semibold">
                          <Flame size={11} fill="white" /> Hot
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5">
                    {it.category && (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold">
                        {it.category}
                      </span>
                    )}
                    <h3 className="font-editorial text-xl text-white leading-tight mt-2 line-clamp-3 group-hover:text-[#05D9E8] transition">
                      {it.title}
                    </h3>
                    {(it.aiSummary || it.excerpt) && (
                      <p className="text-sm text-zinc-400 mt-3 line-clamp-3 leading-relaxed">
                        {it.aiSummary || it.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      <span>{timeAgo(it.publishedAt || it.scrapedAt)}</span>
                      <span className="h-1 w-1 rounded-full bg-zinc-700" />
                      <span className="inline-flex items-center gap-1">
                        Read at source <ExternalLink size={10} />
                      </span>
                      {(it.commentsCount || 0) > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-zinc-700" />
                          <span>{it.commentsCount} comments</span>
                        </>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Intel;
