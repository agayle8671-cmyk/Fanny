import { Link } from "react-router-dom";
import { articles } from "../data/articles";
import { ScrollReveal } from "../components/ScrollReveal";

const News = () => {
  const [hero, ...rest] = articles;
  return (
    <div data-testid="news-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <ScrollReveal direction="up" duration={0.9}>
          <header className="mb-16 max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF2A6D] mb-4 font-semibold">
              The Editorial Desk
            </p>
            <h1 className="font-display text-6xl md:text-8xl uppercase leading-[0.9] text-white">
              News &amp; Features
            </h1>
            <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
              Long-form coverage on Grand Theft Auto VI. Verified information,
              in-engine analysis, and the kind of editorial GTA fandom deserves.
            </p>
          </header>
        </ScrollReveal>

        {/* Lead story */}
        <ScrollReveal direction="up" duration={0.95} delay={0.1}>
          <Link
            to={`/news/${hero.slug}`}
            data-testid="news-lead-story"
            className="group block relative aspect-[21/9] rounded-xl overflow-hidden border border-white/10 mb-16"
          >
            <img
              src={hero.heroImage}
              alt={hero.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 max-w-4xl">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#FF2A6D] font-semibold">
                Lead Story · {hero.category}
              </span>
              <h2 className="font-editorial text-4xl md:text-6xl leading-tight text-white mt-3">
                {hero.title}
              </h2>
              <p className="mt-4 text-zinc-300 text-lg max-w-2xl">{hero.dek}</p>
              <div className="mt-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-zinc-400">
                <span>{hero.author}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{hero.date}</span>
                <span className="h-1 w-1 rounded-full bg-zinc-600" />
                <span>{hero.readTime}</span>
              </div>
            </div>
          </Link>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-24">
          {rest.map((a, i) => (
            <ScrollReveal key={a.slug} direction="up" delay={i * 0.07} duration={0.75}>
              <Link
                to={`/news/${a.slug}`}
                data-testid={`news-grid-item-${a.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/5 mb-4">
                  <img
                    src={a.heroImage}
                    alt={a.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.25em] text-[#FF2A6D] font-semibold bg-black/60 px-2 py-1 rounded-sm">
                    {a.category}
                  </span>
                </div>
                <h3 className="font-editorial text-2xl text-white leading-tight group-hover:text-[#FF2A6D] transition-colors">
                  {a.title}
                </h3>
                <p className="text-zinc-400 mt-2 text-sm line-clamp-2">{a.dek}</p>
                <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                  <span>{a.date}</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>{a.readTime}</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
