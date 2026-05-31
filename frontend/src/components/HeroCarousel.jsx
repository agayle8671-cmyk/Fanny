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

export const HeroCarousel = ({ articles = [], onSlideChange }) => {
  const [index, setIndex] = useState(0);

  const slides = articles.length > 0
    ? articles.map((art, idx) => ({
        image: art.heroImage || art.imageThumbnail || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'><rect width='1920' height='1080' fill='%23050505'/></svg>",
        label: art.title,
        accent: idx % 3 === 0 ? "#FF2A6D" : idx % 3 === 1 ? "#05D9E8" : "#FF7B00",
        cue: art.dek || "",
        category: art.category,
        slug: art.slug
      }))
    : heroSlides;

  useEffect(() => {
    setIndex(0); // Reset index when articles update
  }, [articles.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 10000);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (onSlideChange && slides[index]) {
      onSlideChange(slides[index], index);
    }
  }, [index, onSlideChange, slides]);

  return (
    <>
      <div className="absolute inset-0 z-0 grain" data-testid="hero-carousel">
        {slides.map((s, i) => (
          <div
            key={s.image + i}
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
            className="font-display text-xl text-white max-w-[300px] truncate"
            style={{ color: slides[index]?.accent }}
          >
            {slides[index]?.category || "COVER STORY"}
          </span>
          <span className="font-editorial italic text-xs text-zinc-300 max-w-[260px] text-right line-clamp-2">
            {slides[index]?.label}
          </span>
        </div>
        <div className="flex items-center gap-2" data-testid="hero-dots">
          {slides.map((s, i) => (
            <button
              key={s.image + i}
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
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </div>
      </div>
    </>
  );
};
