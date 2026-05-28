import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const HorizontalRail = ({ title, subtitle, children, testid }) => {
  const scrollerRef = useRef(null);

  const scroll = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = node.clientWidth * 0.85;
    node.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="py-12" data-testid={testid}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display text-3xl md:text-4xl tracking-[0.02em] uppercase text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl">{subtitle}</p>
            )}
          </div>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll(-1)}
              data-testid={`${testid}-scroll-left`}
              aria-label="Scroll left"
              className="h-10 w-10 grid place-items-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll(1)}
              data-testid={`${testid}-scroll-right`}
              aria-label="Scroll right"
              className="h-10 w-10 grid place-items-center rounded-full border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 hide-scrollbar"
        >
          {children}
        </div>
      </div>
    </section>
  );
};
