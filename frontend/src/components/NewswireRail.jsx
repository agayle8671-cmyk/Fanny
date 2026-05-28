import { useEffect, useState } from "react";
import { ExternalLink, Flame } from "lucide-react";
import { api, timeAgo, fallbackThumb } from "../lib/api";
import { HorizontalRail } from "./HorizontalRail";

const NewswireCard = ({ item, index }) => {
  const thumb = item.imageThumbnail || item.videoThumbnail || fallbackThumb(index);
  const isExternal = !!item.url || !!item.sourceUrl;
  const linkUrl = item.url || item.sourceUrl || "#";
  const isHot = (item.newsValueScore || 0) >= 70;

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      data-testid={`newswire-card-${item.slug}`}
      className="group relative flex-none snap-start w-[300px] md:w-[360px] aspect-[16/10] overflow-hidden rounded-lg border border-white/5 bg-zinc-900 transition-all duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-cyan-500/20 hover:border-white/20"
    >
      <img
        src={thumb}
        alt={item.title}
        onError={(e) => {
          e.currentTarget.src = fallbackThumb(index + 1);
        }}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
      />
      <div className="absolute inset-0 hero-overlay" />

      {/* Top-row badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-white bg-black/65 px-2 py-1 rounded-sm">
          {item.sourceName || "Newswire"}
        </span>
        {isHot && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.22em] text-white bg-[#FF2A6D] px-2 py-1 rounded-sm font-semibold">
            <Flame size={11} fill="white" /> Hot
          </span>
        )}
      </div>

      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        {item.category && (
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold mb-2">
            {item.category}
          </span>
        )}
        <h3 className="font-editorial text-lg md:text-xl text-white leading-tight line-clamp-3">
          {item.title}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-3 text-xs text-zinc-300 line-clamp-2">
          {item.aiSummary || item.excerpt}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          <span>{timeAgo(item.publishedAt || item.scrapedAt)}</span>
          {isExternal && (
            <>
              <span className="h-1 w-1 rounded-full bg-zinc-600" />
              <span className="inline-flex items-center gap-1">
                Source <ExternalLink size={10} />
              </span>
            </>
          )}
        </div>
      </div>

      <span className="absolute bottom-0 left-0 h-px w-0 bg-[#05D9E8] group-hover:w-full transition-all duration-500" />
    </a>
  );
};

export const NewswireRail = () => {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;
    api.listArticles({ limit: 12 }).then((res) => {
      if (!alive) return;
      setItems(res?.items || []);
    });
    return () => {
      alive = false;
    };
  }, []);

  // While loading or if there's nothing scraped yet, render a graceful empty state.
  if (items === null) return null;
  if (items.length === 0) {
    return (
      <section className="py-12 border-t border-white/5" data-testid="newswire-empty">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-3xl md:text-4xl uppercase text-white">
                The Newswire
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                Real-time intel scraped from across the web. Coming online soon.
              </p>
            </div>
            <a
              href="/intel"
              className="text-xs uppercase tracking-[0.25em] text-[#05D9E8] hover:text-white"
            >
              Open the wire →
            </a>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
            <p className="text-zinc-500 text-sm uppercase tracking-[0.22em]">
              Newswire is warming up. Editorial pieces below.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <HorizontalRail
      testid="rail-newswire"
      title="The Newswire"
      subtitle="Real-time intel scraped from across the web — IGN, GameSpot, Eurogamer, Reddit and more. Top stories first."
    >
      {items.map((item, i) => (
        <NewswireCard key={item.slug || i} item={item} index={i} />
      ))}
    </HorizontalRail>
  );
};
