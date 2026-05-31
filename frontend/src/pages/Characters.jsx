import { Link } from "react-router-dom";
import { characters } from "../data/characters";
import { ScrollReveal } from "../components/ScrollReveal";

const Characters = () => {
  const protagonists = characters.filter((c) => c.role === "Protagonist");
  const others = characters.filter((c) => c.role !== "Protagonist");
  return (
    <div data-testid="characters-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" duration={0.9}>
          <header className="mb-16 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF2A6D] mb-4 font-semibold">
              The Cast
            </p>
            <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
              Characters
            </h1>
            <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
              The lovers, the smugglers, the influencers, the conspiracy theorists,
              and the old-guard returns shaping Grand Theft Auto VI.
            </p>
          </header>
        </ScrollReveal>

        {/* Protagonists — large cinematic cards */}
        <section className="mb-24">
          <ScrollReveal direction="up" duration={0.8}>
            <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
              The Protagonists
            </h2>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {protagonists.map((c, i) => (
              <ScrollReveal key={c.slug} direction={i === 0 ? "right" : "left"} duration={0.95} delay={i * 0.1}>
                <Link
                  to={`/characters/${c.slug}`}
                  data-testid={`protagonist-card-${c.slug}`}
                  className="group relative block aspect-[3/4] rounded-xl overflow-hidden border border-white/10"
                >
                  <img
                    src={c.coverImage}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-[#050505]/75 backdrop-blur-md border border-[#FF2A6D]/30 px-3 py-1 rounded text-[9px] uppercase tracking-[0.2em] font-semibold text-zinc-300">
                    Official Screenshot
                  </div>
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute bottom-0 p-8 md:p-10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#05D9E8] font-semibold">
                      {c.role}
                    </span>
                    <h3 className="font-display text-5xl md:text-7xl text-white leading-none mt-2">
                      {c.name}
                    </h3>
                    <p className="font-editorial italic text-zinc-200 mt-4 max-w-md">
                      {c.tagline}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* Supporting */}
        <section className="pb-24">
          <ScrollReveal direction="up" duration={0.8}>
            <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
              Supporting Cast
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {others.map((c, i) => (
              <ScrollReveal key={c.slug} direction="zoom" delay={i * 0.06} duration={0.65}>
                <Link
                  to={`/characters/${c.slug}`}
                  data-testid={`supporting-card-${c.slug}`}
                  className="group relative block aspect-[2/3] rounded-md overflow-hidden border border-white/5"
                >
                  <img
                    src={c.image}
                    alt={c.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 z-20 bg-[#050505]/75 backdrop-blur-sm border border-white/5 px-2 py-0.5 rounded text-[8px] uppercase tracking-[0.15em] font-semibold text-zinc-400">
                    Official Screenshot
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold">
                      {c.role}
                    </span>
                    <h3 className="font-display text-2xl text-white leading-none mt-1">
                      {c.name}
                    </h3>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Characters;
