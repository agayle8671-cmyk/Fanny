import { confirmedSongs, radioStations } from "../data/soundtrack";

const Soundtrack = () => {
  return (
    <div data-testid="soundtrack-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-16 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF7B00] mb-4 font-semibold">
            The Frequencies
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            Soundtrack
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Three songs officially confirmed. A grid of stations Vice City has
            always demanded. The playlist of a crime wave.
          </p>
        </header>

        {/* Confirmed songs */}
        <section className="mb-24">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
            Confirmed Tracks
          </h2>
          <div className="space-y-4">
            {confirmedSongs.map((s, idx) => (
              <article
                key={s.title}
                data-testid={`song-row-${idx}`}
                className="flex flex-col md:flex-row items-stretch gap-6 p-5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="md:w-48 aspect-square rounded-lg overflow-hidden flex-none">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-baseline gap-4 flex-wrap">
                    <h3 className="font-editorial text-3xl md:text-4xl text-white leading-tight">
                      {s.title}
                    </h3>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                      {s.year}
                    </span>
                  </div>
                  <p className="text-[#FF2A6D] uppercase tracking-[0.25em] text-xs font-semibold mt-2">
                    {s.artist}
                  </p>
                  <p className="text-sm text-zinc-300 mt-3 leading-relaxed max-w-2xl">
                    {s.description}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mt-3">
                    Confirmed in: {s.confirmedIn}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Radio stations */}
        <section className="pb-24">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
            The Radio Dial
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {radioStations.map((r) => (
              <article
                key={r.name}
                data-testid={`station-card-${r.name.replace(/\s+/g, "-").toLowerCase()}`}
                className="relative aspect-[5/4] rounded-xl overflow-hidden border border-white/10 group"
              >
                <img
                  src={r.image}
                  alt={r.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 hero-overlay" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#05D9E8] font-semibold">
                    {r.genre}
                  </span>
                  <h3 className="font-display text-4xl text-white leading-none mt-2">
                    {r.name}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-3 leading-relaxed">
                    {r.description}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#FF7B00] mt-3">
                    {r.status}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Soundtrack;
