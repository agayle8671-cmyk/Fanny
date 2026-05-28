import { useEffect, useState } from "react";

// Rotating hero with Ken Burns slow-zoom + crossfade.
// Each slide gets its own keyword & color accent that gets fed back to the parent.
export const heroSlides = [
  {
    image:
      "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/6dccb50f1f97f2f4f27319ab01773127d24f381cb080704869c46c535155b382.png",
    label: "Vice City · Skyline",
    accent: "#FF2A6D",
    cue: "Sunset over Tequesta",
  },
  {
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400",
    label: "Vice Beach · Collins Ave",
    accent: "#05D9E8",
    cue: "Neon hour, palm shadow, salt air",
  },
  {
    image: "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c?q=80&w=2400",
    label: "Leonida · Coastline",
    accent: "#FF7B00",
    cue: "South past Card Sound Bridge",
  },
  {
    image: "https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400",
    label: "Little Cuba · Night",
    accent: "#FF2A6D",
    cue: "Neon, contraband, José Martí Park",
  },
  {
    image: "https://images.unsplash.com/photo-1605723517503-3cadb5818a0c?q=80&w=2400",
    label: "Mariana County · The Keys",
    accent: "#05D9E8",
    cue: "Brian's Marina — where it begins",
  },
];

export const HeroCarousel = ({ onSlideChange }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (onSlideChange) onSlideChange(heroSlides[index], index);
  }, [index, onSlideChange]);

  return (
    <>
      <div className="absolute inset-0 z-0 grain" data-testid="hero-carousel">
        {heroSlides.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-[2200ms] ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={s.image}
              alt={s.label}
              className={`w-full h-full object-cover ${
                i === index ? "animate-kenburns" : ""
              }`}
            />
          </div>
        ))}
      </div>

      {/* Slide indicator (bottom-right) */}
      <div className="absolute right-6 md:right-12 bottom-32 md:bottom-12 z-30 flex flex-col items-end gap-4">
        <div className="hidden md:flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-[0.35em] text-zinc-400">
            Now Showing
          </span>
          <span
            data-testid="hero-slide-label"
            className="font-display text-xl text-white"
            style={{ color: heroSlides[index].accent }}
          >
            {heroSlides[index].label}
          </span>
          <span className="font-editorial italic text-xs text-zinc-300 max-w-[260px] text-right">
            {heroSlides[index].cue}
          </span>
        </div>
        <div className="flex items-center gap-2" data-testid="hero-dots">
          {heroSlides.map((s, i) => (
            <button
              key={s.image}
              data-testid={`hero-dot-${i}`}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === index
                  ? "h-1.5 w-10 bg-white"
                  : "h-1.5 w-4 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <div className="hidden md:block text-[10px] uppercase tracking-[0.35em] text-zinc-500 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(heroSlides.length).padStart(2, "0")}
        </div>
      </div>
    </>
  );
};
