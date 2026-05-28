import { useState } from "react";
import { weapons, weaponCategories } from "../data/weapons";

const StatBar = ({ label, value }) => (
  <div className="flex items-center gap-3">
    <span className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 w-16">
      {label}
    </span>
    <div className="flex-1 h-1 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          width: `${value}%`,
          background: "linear-gradient(90deg, #FF2A6D 0%, #05D9E8 100%)",
        }}
      />
    </div>
    <span className="text-[10px] text-zinc-300 w-6 text-right tabular-nums">
      {value}
    </span>
  </div>
);

const Arsenal = () => {
  const [filter, setFilter] = useState("All");
  const filtered =
    filter === "All" ? weapons : weapons.filter((w) => w.category === filter);

  return (
    <div data-testid="arsenal-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-12 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] mb-4 font-semibold">
            The Arsenal
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            Weapons Database
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Pistols, SMGs, rifles, shotguns, heavy ordnance. The full Leonida
            loadout — manufacturer specs, real-world inspirations, in-game stats.
          </p>
        </header>

        <div
          className="flex flex-wrap gap-2 mb-10"
          data-testid="arsenal-filter-bar"
        >
          {["All", ...weaponCategories].map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              data-testid={`weapon-filter-${c.toLowerCase()}`}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {filtered.map((w) => (
            <article
              key={w.name}
              data-testid={`weapon-card-${w.name.replace(/\s+/g, "-").toLowerCase()}`}
              className="rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={w.image}
                  alt={w.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 hero-overlay" />
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] text-[#FF2A6D] font-semibold bg-black/60 px-2 py-1 rounded-sm">
                  {w.category}
                </div>
                <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-[0.22em] text-zinc-300 bg-black/60 px-2 py-1 rounded-sm tabular-nums">
                  {w.capacity > 0 ? `${w.capacity} rds` : "—"}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-2xl text-white leading-none">
                    {w.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {w.manufacturer}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Ammo <span className="text-zinc-200">{w.ammo}</span>
                  <span className="text-zinc-700 mx-2">·</span>
                  Inspired by{" "}
                  <span className="text-zinc-200">{w.realInspiration}</span>
                </p>
                <div className="space-y-2 pt-2">
                  <StatBar label="Damage" value={w.stats.damage} />
                  <StatBar label="Range" value={w.stats.range} />
                  <StatBar label="Accuracy" value={w.stats.accuracy} />
                  <StatBar label="Rate" value={w.stats.fireRate} />
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed pt-2 border-t border-white/5 mt-3">
                  {w.notes}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Arsenal;
