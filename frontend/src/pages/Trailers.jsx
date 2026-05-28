import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { trailers } from "../data/trailers";

const Trailers = () => {
  const [active, setActive] = useState(null);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);
  return (
    <div data-testid="trailers-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF2A6D] mb-4 font-semibold">
            The Media Vault
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            Trailers
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Official Rockstar trailers and environment supercuts. Click to play
            in-page.
          </p>
        </header>

        {/* Featured */}
        <div
          data-testid="featured-trailer"
          className="relative aspect-video rounded-xl overflow-hidden border border-white/10 mb-16 group cursor-pointer"
          onClick={() => setActive(trailers[0])}
        >
          <img
            src={trailers[0].thumbnail}
            alt={trailers[0].title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-[#FF2A6D] grid place-items-center group-hover:scale-110 transition-transform shadow-2xl shadow-pink-500/40">
              <Play size={36} fill="white" className="ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 p-8 max-w-3xl">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#05D9E8] font-semibold">
              Featured · {trailers[0].releaseDate}
            </span>
            <h2 className="font-display text-4xl md:text-6xl text-white leading-none mt-3">
              {trailers[0].title}
            </h2>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {trailers.map((t) => (
            <button
              key={t.slug}
              data-testid={`trailer-card-${t.slug}`}
              onClick={() => setActive(t)}
              className="group text-left block"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/5 mb-4">
                <img
                  src={t.thumbnail}
                  alt={t.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-white/95 grid place-items-center group-hover:scale-110 transition-transform">
                    <Play size={20} fill="black" className="ml-0.5 text-black" />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.25em] text-white bg-black/70 px-2 py-1 rounded-sm">
                  {t.duration}
                </span>
              </div>
              <h3 className="font-display text-2xl text-white leading-none group-hover:text-[#FF2A6D] transition">
                {t.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-2 uppercase tracking-[0.22em]">
                {t.releaseDate}
              </p>
              <p className="text-sm text-zinc-400 mt-2 line-clamp-2">
                {t.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div
          data-testid="trailer-modal"
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setActive(null)}
        >
          <button
            data-testid="trailer-modal-close"
            className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center text-white"
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div
            className="w-full max-w-6xl aspect-video bg-black rounded-xl overflow-hidden border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              key={active.slug}
              src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
              title={active.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Trailers;
