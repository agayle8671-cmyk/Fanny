import { useState } from "react";
import { vehicles, vehicleCategories } from "../data/vehicles";
import { ScrollReveal } from "../components/ScrollReveal";

const StatBar = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 w-16">
      {label}
    </span>
    <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 100%)",
        }}
      />
    </div>
    <span className="text-[10px] text-zinc-300 w-6 text-right tabular-nums">
      {value}
    </span>
  </div>
);

const Vehicles = () => {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All" ? vehicles : vehicles.filter((v) => v.category === filter);

  return (
    <div data-testid="vehicles-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" duration={0.9}>
          <header className="mb-12 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF7B00] mb-4 font-semibold">
              The Garage
            </p>
            <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
              Vehicle Database
            </h1>
            <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
              Muscle, off-road, watercraft, SUVs, compacts, emergency. The
              cross-referenced roster of confirmed and expected GTA VI rides.
            </p>
          </header>
        </ScrollReveal>

        {/* Filter pills */}
        <ScrollReveal direction="up" delay={0.1} duration={0.8}>
          <div className="flex flex-wrap gap-2 mb-10" data-testid="vehicles-filter-bar">
            {["All", ...vehicleCategories].map((c) => (
              <button
                key={c}
                data-testid={`vehicle-filter-${c.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`}
                onClick={() => setFilter(c)}
                className={`text-[11px] uppercase tracking-[0.25em] px-4 py-2 rounded-full border transition-all duration-200 ${
                  filter === c
                    ? "bg-[#FF2A6D] border-[#FF2A6D] text-white"
                    : "border-white/15 text-zinc-300 hover:border-white/40 hover:text-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filtered.map((v, i) => (
            <ScrollReveal key={v.name} direction="up" delay={i * 0.06} duration={0.7}>
              <article
                data-testid={`vehicle-card-${v.name.replace(/\s+/g, "-").toLowerCase()}`}
                className="rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={v.image}
                    alt={v.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] text-[#FF7B00] font-semibold bg-black/60 px-2 py-1 rounded-sm">
                    {v.category}
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-3xl text-white leading-none">
                      {v.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      {v.manufacturer}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Inspired by{" "}
                    <span className="text-zinc-200">{v.realInspiration}</span>
                  </p>
                  <div className="space-y-2 pt-2">
                    <StatBar label="Speed" value={v.stats.speed} />
                    <StatBar label="Accel" value={v.stats.acceleration} />
                    <StatBar label="Handle" value={v.stats.handling} />
                    <StatBar label="Brake" value={v.stats.braking} />
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/5 mt-3">
                    {v.notes}
                  </p>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Vehicles;
