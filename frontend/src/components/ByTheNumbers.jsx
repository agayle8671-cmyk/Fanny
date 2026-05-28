// IMDb-style data density bento — "By The Numbers" at-a-glance grid.
const cells = [
  {
    value: "2.5×",
    label: "Map Size vs. Los Santos",
    accent: "#FF2A6D",
    size: "lg",
    note: "The largest open world Rockstar has ever shipped.",
  },
  {
    value: "12",
    label: "Confirmed Districts & Counties",
    accent: "#05D9E8",
    size: "md",
    note: "Six in Vice City. Six across the State of Leonida.",
  },
  {
    value: "02",
    label: "Protagonists, One Relationship Bar",
    accent: "#FF7B00",
    size: "md",
    note: "Lucia & Jason. Romance is a system, not a cutscene.",
  },
  {
    value: "30",
    label: "FPS · Base Console Target",
    accent: "#FFFFFF",
    size: "sm",
    note: "Fidelity-first. Performance mode TBA.",
  },
  {
    value: "RTGI",
    label: "Real-Time Global Illumination",
    accent: "#05D9E8",
    size: "sm",
    note: "Running on base PS5.",
  },
  {
    value: "11.19.26",
    label: "Worldwide Launch · PS5 · Xbox X|S",
    accent: "#FF2A6D",
    size: "lg",
    note: "After two delays. No PC date confirmed.",
  },
];

const sizeMap = {
  lg: "md:col-span-2 md:row-span-2",
  md: "md:col-span-2",
  sm: "md:col-span-1",
};

export const ByTheNumbers = () => {
  return (
    <section
      data-testid="by-the-numbers"
      className="relative py-24 border-y border-white/5 bg-[#070708]"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] font-semibold mb-3">
              The Data Room
            </p>
            <h2 className="font-display uppercase text-4xl md:text-6xl text-white leading-[0.95]">
              GTA VI <span className="text-zinc-500">/</span> By The Numbers
            </h2>
          </div>
          <p className="font-editorial italic text-zinc-400 max-w-md text-lg">
            The vital stats of the most anticipated entertainment release of the
            decade — at a glance.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 auto-rows-[160px] md:auto-rows-[180px]">
          {cells.map((c, i) => (
            <div
              key={i}
              data-testid={`number-cell-${i}`}
              className={`group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 p-5 md:p-7 flex flex-col justify-between ${sizeMap[c.size]}`}
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition"
                style={{ background: c.accent }}
              />
              <div className="relative">
                <div
                  className="font-display leading-[0.85] tabular-nums"
                  style={{
                    color: c.accent,
                    fontSize:
                      c.size === "lg"
                        ? "clamp(3rem, 8vw, 7rem)"
                        : c.size === "md"
                        ? "clamp(2.5rem, 5vw, 4.5rem)"
                        : "clamp(2rem, 4vw, 3rem)",
                  }}
                >
                  {c.value}
                </div>
                <div className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-300 mt-3 max-w-[20ch]">
                  {c.label}
                </div>
              </div>
              <p className="relative text-[11px] text-zinc-500 leading-relaxed mt-4 opacity-80 group-hover:opacity-100 transition max-w-[28ch]">
                {c.note}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
