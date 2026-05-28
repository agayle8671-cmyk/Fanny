// Editorial-style infinite scrolling marquee strip.
export const MarqueeStrip = ({ items, accent = "#FF2A6D", testid = "marquee-strip" }) => {
  // Duplicate items so the strip loops seamlessly.
  const list = [...items, ...items];
  return (
    <div
      data-testid={testid}
      className="relative overflow-hidden border-y border-white/10 bg-[#0A0A0C] py-5"
    >
      <div className="flex whitespace-nowrap animate-marquee">
        {list.map((it, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-6 font-display text-2xl md:text-3xl uppercase tracking-[0.06em] text-white"
          >
            {it}
            <span
              className="inline-block h-2 w-2 rotate-45"
              style={{ background: accent }}
            />
          </span>
        ))}
      </div>
    </div>
  );
};
