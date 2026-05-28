import { Link } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import { Countdown } from "../components/Countdown";
import { HorizontalRail } from "../components/HorizontalRail";
import { ArticleCard } from "../components/ArticleCard";
import { CharacterCard } from "../components/CharacterCard";
import { LocationCard } from "../components/LocationCard";
import { articles } from "../data/articles";
import { characters } from "../data/characters";
import { locations } from "../data/locations";
import { vehicles } from "../data/vehicles";
import { gameInfo } from "../data/gameInfo";

const Home = () => {
  const heroArticle = articles[0];

  return (
    <div data-testid="home-page" className="bg-[#050505] text-white">
      {/* HERO BILLBOARD */}
      <section
        data-testid="home-hero"
        className="relative w-full min-h-[100vh] flex items-end overflow-hidden scanline"
      >
        <div className="absolute inset-0 z-0 grain">
          <img
            src={heroArticle.heroImage}
            alt="Vice City sunset hero"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 side-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24 pt-40">
          <div className="max-w-3xl space-y-7">
            <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-[#05D9E8] font-semibold animate-fade-up">
              <span className="h-px w-10 bg-[#05D9E8]" />
              Welcome to Leonida
            </span>
            <h1
              className="font-display uppercase text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[0.01em] text-white animate-fade-up delay-150 vice-glow"
              data-testid="home-hero-title"
            >
              The Most <br />
              <span
                style={{
                  background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Anticipated
              </span>{" "}
              <br />
              Game Of All Time
            </h1>
            <p className="font-editorial text-xl md:text-2xl italic text-zinc-200 max-w-2xl leading-snug animate-fade-up delay-300">
              Grand Theft Auto VI returns to Vice City — and an entire state called
              Leonida — on November 19, 2026. This is the fan archive.
            </p>
            <div className="animate-fade-up delay-500">
              <Countdown />
            </div>
            <div className="flex flex-wrap gap-4 pt-2 animate-fade-up delay-700">
              <Link
                to="/trailers"
                data-testid="home-hero-watch-trailer-btn"
                className="inline-flex items-center gap-3 px-7 py-4 bg-[#FF2A6D] text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-[#FF7B00] transition-colors duration-300"
              >
                <Play size={16} fill="white" /> Watch Trailer
              </Link>
              <Link
                to="/news"
                data-testid="home-hero-explore-btn"
                className="inline-flex items-center gap-3 px-7 py-4 border border-white/30 text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-white hover:text-black transition-colors duration-300"
              >
                Explore the Archive <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED EDITORIAL */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 items-center">
          <Link
            to={`/news/${articles[1].slug}`}
            data-testid="home-featured-article"
            className="md:col-span-7 group relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10"
          >
            <img
              src={articles[1].heroImage}
              alt={articles[1].title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 hero-overlay" />
            <div className="absolute bottom-0 left-0 p-8">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#FF2A6D] font-semibold">
                Editor's Pick · {articles[1].category}
              </span>
            </div>
          </Link>
          <div className="md:col-span-5 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold">
              The Cover Story
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl text-white leading-tight">
              {articles[1].title}
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">{articles[1].dek}</p>
            <Link
              to={`/news/${articles[1].slug}`}
              className="inline-flex items-center gap-3 text-[#FF2A6D] uppercase tracking-[0.25em] text-xs font-semibold hover:text-white transition"
            >
              Read the Feature <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS RAIL */}
      <HorizontalRail
        testid="rail-news"
        title="Latest from the Newsroom"
        subtitle="Long-form editorial on the most anticipated game of the decade. Updated weekly."
      >
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </HorizontalRail>

      {/* CHARACTERS RAIL */}
      <HorizontalRail
        testid="rail-characters"
        title="The Cast of Leonida"
        subtitle="Lucia. Jason. Heder. Boobie Ike. Cal Hampton. The criminals, smugglers, and influencers shaping GTA VI."
      >
        {characters.map((c) => (
          <CharacterCard key={c.slug} character={c} />
        ))}
      </HorizontalRail>

      {/* LOCATIONS RAIL */}
      <HorizontalRail
        testid="rail-locations"
        title="The State of Leonida"
        subtitle="Vice City's six districts plus the rural counties stretching from the Keys to Mount Kalaga."
      >
        {locations.map((l) => (
          <LocationCard key={l.slug} location={l} />
        ))}
      </HorizontalRail>

      {/* VEHICLES STRIP */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-display uppercase text-4xl md:text-5xl text-white">
                The Garage
              </h2>
              <p className="text-sm text-zinc-400 mt-2 max-w-2xl">
                Muscle, off-road, watercraft. The Leonida roster — at a glance.
              </p>
            </div>
            <Link
              to="/vehicles"
              className="hidden md:inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-300 hover:text-white"
              data-testid="home-vehicles-cta"
            >
              All vehicles <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {vehicles.slice(0, 8).map((v) => (
              <div
                key={v.name}
                className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/5 bg-zinc-900"
              >
                <img
                  src={v.image}
                  alt={v.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 hero-overlay" />
                <div className="absolute bottom-0 p-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF7B00] font-semibold">
                    {v.category}
                  </span>
                  <h3 className="font-display text-2xl text-white leading-none mt-1">
                    {v.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / RELEASE MARQUEE */}
      <section className="relative py-32 border-t border-white/5 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1589066724013-06f34f2cc17c"
            alt="vice city sunset"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/70 to-[#050505] z-10" />
        <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 text-center space-y-8">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8]">
            Launch Window Confirmed
          </p>
          <h2 className="font-display text-6xl md:text-8xl text-white leading-none">
            {gameInfo.releaseDateDisplay}
          </h2>
          <p className="font-editorial italic text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto">
            PlayStation 5 · Xbox Series X|S. No PC launch confirmed.
          </p>
          <div className="flex justify-center">
            <Countdown />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
