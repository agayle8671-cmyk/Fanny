import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, ArrowRight, Terminal } from "lucide-react";
import { Countdown } from "../components/Countdown";
import { HorizontalRail } from "../components/HorizontalRail";
import { ArticleCard } from "../components/ArticleCard";
import { CharacterCard } from "../components/CharacterCard";
import { LocationCard } from "../components/LocationCard";
import { HeroCarousel } from "../components/HeroCarousel";
import { MarqueeStrip } from "../components/MarqueeStrip";
import { ByTheNumbers } from "../components/ByTheNumbers";
import { ShareWidget } from "../components/ShareWidget";
import { api } from "../lib/api";
import { articles as localArticles } from "../data/articles";
import { characters } from "../data/characters";
import { locations } from "../data/locations";
import { vehicles } from "../data/vehicles";
import { gameInfo } from "../data/gameInfo";
import { ScrollReveal } from "../components/ScrollReveal";

function normalizeArticle(a) {
  return {
    ...a,
    heroImage:  a.heroImage || a.imageThumbnail || a.videoThumbnail || null,
    dek:        a.dek || a.aiSummary || a.excerpt || "",
    date:       a.date || (a.publishedAt || a.approvedAt || a.scrapedAt || "").slice(0, 10),
    author:     a.author || "Leonida Vice",
    readTime:   a.readTime || "2 min read",
    category:   a.category || "Intel",
    slug:       a.slug || "",
  };
}

const Home = () => {
  const [activeArticle, setActiveArticle] = useState(null);
  const [allArticles, setAllArticles] = useState(localArticles.map(normalizeArticle));

  useEffect(() => {
    let alive = true;
    api.listArticles({ limit: 20 }).then((res) => {
      if (!alive) return;
      const backendItems = (res?.items || []).map(normalizeArticle);
      const merged = [...localArticles.map(normalizeArticle)];
      backendItems.forEach(art => {
        if (art.slug && !merged.some(a => a.slug === art.slug)) {
          merged.push(art);
        }
      });
      merged.sort((a, b) => {
        // approvedAt = when published on THIS site (always use first)
        const ta = Date.parse(a.approvedAt || a.publishedAt || a.date || "") || 0;
        const tb = Date.parse(b.approvedAt || b.publishedAt || b.date || "") || 0;
        return tb - ta;
      });
      setAllArticles(merged);
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  // Split and format dynamic titles to follow split-row layout with Vice gradients
  const renderHeroTitle = (title) => {
    if (!title) return null;
    const words = title.split(" ");
    if (words.length <= 2) {
      return (
        <span
          style={{
            background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </span>
      );
    }
    const midIndex = Math.floor(words.length / 2);
    const firstPart = words.slice(0, midIndex).join(" ");
    const gradientPart = words[midIndex];
    const lastPart = words.slice(midIndex + 1).join(" ");
    return (
      <>
        {firstPart} <br />
        <span
          style={{
            background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {gradientPart}
        </span>{" "}
        <br />
        {lastPart}
      </>
    );
  };

  // Top 8 most recent articles that have a hero image for the carousel
  const heroArticles = allArticles.filter(a => a.heroImage || a.imageThumbnail).slice(0, 8);

  return (
    <div data-testid="home-page" className="bg-[#050505] text-white">
      {/* HERO BILLBOARD — rotating, Ken Burns */}
      <section
        data-testid="home-hero"
        className="relative w-full min-h-[100vh] flex items-end overflow-hidden scanline vignette"
      >
        <HeroCarousel
          articles={heroArticles}
          onSlideChange={(slide, i) => setActiveArticle(heroArticles[i])}
        />

        <div className="absolute inset-0 z-10 side-overlay" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

        {/* Vertical edge label — magazine flourish */}
        <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 flex-col items-center gap-4 text-[10px] uppercase tracking-[0.4em] text-zinc-400">
          <span
            className="rotate-180"
            style={{ writingMode: "vertical-rl" }}
          >
            Leonida Vice · Cover Story · Vol. 01
          </span>
          <span className="h-16 w-px bg-zinc-700" />
        </div>

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24 pt-40">
          <div className="max-w-3xl space-y-7">
            <span className="inline-flex items-center gap-3 text-[11px] tracking-[0.4em] uppercase text-[#05D9E8] font-semibold animate-fade-up">
              <span className="h-px w-10 bg-[#05D9E8]" />
              {activeArticle ? activeArticle.category : "Welcome to Leonida"}
            </span>

            {activeArticle ? (
              <Link to={`/news/${activeArticle.slug}`} className="block group">
                <h1
                  className="font-display uppercase text-4xl md:text-6xl lg:text-7xl leading-[0.95] tracking-[0.01em] text-white animate-fade-up delay-150 vice-glow group-hover:text-[#05D9E8] transition-colors duration-300"
                  data-testid="home-hero-title"
                >
                  {renderHeroTitle(activeArticle.title)}
                </h1>
              </Link>
            ) : (
              <h1
                className="font-display uppercase text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-[0.01em] text-white animate-fade-up delay-150 vice-glow"
                data-testid="home-hero-title"
              >
                The Most <br />
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Anticipated
                </span>{" "}
                <br />
                Game Of All Time
              </h1>
            )}

            <p className="font-editorial text-xl md:text-2xl italic text-zinc-200 max-w-2xl leading-snug animate-fade-up delay-300 line-clamp-3">
              {activeArticle ? activeArticle.dek : "Grand Theft Auto VI returns to Vice City — and an entire state called Leonida — on November 19, 2026. This is the fan archive."}
            </p>
            <div className="animate-fade-up delay-500">
              <Countdown />
            </div>
            <div className="flex flex-wrap gap-4 pt-2 animate-fade-up delay-700">
              {activeArticle ? (
                <Link
                  to={`/news/${activeArticle.slug}`}
                  data-testid="home-hero-read-article-btn"
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#FF2A6D] text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-[#FF7B00] transition-colors duration-300 shadow-[0_0_15px_rgba(255,42,109,0.35)]"
                >
                  Read Full Article <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/media"
                  data-testid="home-hero-watch-trailer-btn"
                  className="inline-flex items-center gap-3 px-7 py-4 bg-[#FF2A6D] text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-[#FF7B00] transition-colors duration-300"
                >
                  <Play size={16} fill="white" /> Watch Trailer
                </Link>
              )}
              <Link
                to="/news"
                data-testid="home-hero-explore-btn"
                className="inline-flex items-center gap-3 px-7 py-4 border border-white/30 text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-white hover:text-black transition-colors duration-300"
              >
                Explore the Archive <ArrowRight size={16} />
              </Link>
              <Link
                to="/editorial-desk"
                data-testid="home-hero-editorial-btn"
                className="inline-flex items-center gap-3 px-7 py-4 bg-[#05D9E8] text-black font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-[#FF7B00] hover:text-white transition-colors duration-300 shadow-[0_0_15px_rgba(5,217,232,0.35)] hover:shadow-[0_0_25px_rgba(255,123,0,0.5)]"
              >
                <Terminal size={16} /> Editorial Desk
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE STRIP — editorial flourish */}
      <MarqueeStrip
        testid="home-marquee"
        accent="#FF2A6D"
        items={[
          "Welcome to Leonida",
          "November 19, 2026",
          "Vice City Reawakens",
          "Lucia & Jason",
          "The State of Leonida",
          "PS5 · Xbox Series X|S",
          "Two Protagonists, One Conspiracy",
        ]}
      />

      {/* BY THE NUMBERS — IMDb data density */}
      <ByTheNumbers />

      {/* FEATURED EDITORIAL — Cover Story */}
      <section className="py-24 border-b border-white/5 relative">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 items-center">
          <ScrollReveal direction="right" duration={0.9} className="md:col-span-7">
            <Link
              to={`/news/${localArticles[1].slug}`}
              data-testid="home-featured-article"
              className="group relative block aspect-[16/10] overflow-hidden rounded-xl border border-white/10"
            >
              <img
                src={localArticles[1].heroImage}
                alt={localArticles[1].title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 hero-overlay" />
              {/* Cover Story stamp */}
              <div className="absolute top-5 left-5 flex items-center gap-3">
                <span className="font-display text-xs tracking-[0.35em] uppercase text-white bg-[#FF2A6D] px-3 py-1.5">
                  Cover Story
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-200">
                  Issue 06
                </span>
              </div>
              <div className="absolute bottom-0 left-0 p-8">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#FF2A6D] font-semibold">
                  {localArticles[1].category}
                </span>
              </div>
            </Link>
          </ScrollReveal>
          <ScrollReveal direction="left" duration={0.9} delay={0.15} className="md:col-span-5 space-y-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold block">
              The Cover Story
            </span>
            <h2 className="font-editorial text-4xl md:text-5xl text-white leading-tight">
              {localArticles[1].title}
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              {localArticles[1].dek}
            </p>
            <Link
              to={`/news/${localArticles[1].slug}`}
              className="inline-flex items-center gap-3 text-[#FF2A6D] uppercase tracking-[0.25em] text-xs font-semibold hover:text-white transition group/cta"
            >
              <span className="relative">
                Read the Feature
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-current group-hover/cta:w-full transition-all duration-300" />
              </span>
              <ArrowRight size={14} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* NEWS RAIL */}
      <ScrollReveal direction="up" duration={0.85}>
        <HorizontalRail
          testid="rail-news"
          title="Latest from the Newsroom"
          subtitle="Long-form editorial on the most anticipated game of the decade. Updated weekly."
        >
          {allArticles.map((a, i) => (
            <ArticleCard key={a.slug || i} article={a} index={i} />
          ))}
        </HorizontalRail>
      </ScrollReveal>

      {/* CHARACTERS RAIL */}
      <ScrollReveal direction="up" duration={0.85}>
        <HorizontalRail
          testid="rail-characters"
          title="The Cast of Leonida"
          subtitle="Lucia. Jason. Heder. Boobie Ike. Cal Hampton. The criminals, smugglers, and influencers shaping GTA VI."
        >
          {characters.map((c) => (
            <CharacterCard key={c.slug} character={c} />
          ))}
        </HorizontalRail>
      </ScrollReveal>

      {/* SECOND MARQUEE — character litany */}
      <MarqueeStrip
        testid="home-marquee-2"
        accent="#05D9E8"
        items={[
          "Lucia Caminos",
          "Jason Duval",
          "Brian Heder",
          "Cal Hampton",
          "Boobie Ike",
          "Raul Bautista",
          "Dre'Quan Priest",
          "Real Dimez",
          "Stefanie",
          "Phil Cassidy",
        ]}
      />

      {/* LOCATIONS RAIL */}
      <ScrollReveal direction="up" duration={0.85}>
        <HorizontalRail
          testid="rail-locations"
          title="The State of Leonida"
          subtitle="Vice City's six districts plus the rural counties stretching from the Keys to Mount Kalaga."
        >
          {locations.map((l) => (
            <LocationCard key={l.slug} location={l} />
          ))}
        </HorizontalRail>
      </ScrollReveal>

      {/* VEHICLES STRIP */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <ScrollReveal direction="up" duration={0.8}>
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
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {vehicles.slice(0, 8).map((v, i) => (
              <ScrollReveal
                key={v.name}
                direction="zoom"
                delay={i * 0.06}
                duration={0.65}
              >
                <div
                  className="group relative aspect-[4/3] rounded-lg overflow-hidden border border-white/5 bg-zinc-900 h-full"
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
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* SHARE WIDGET — viral CTA */}
      <ShareWidget variant="section" />

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
        <ScrollReveal direction="up" duration={1.0} className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 text-center space-y-8">
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
        </ScrollReveal>
      </section>
    </div>
  );
};

export default Home;
