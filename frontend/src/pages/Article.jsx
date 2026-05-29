import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { getArticle, articles } from "../data/articles";
import { api } from "../lib/api";
import { ReadingProgress } from "../components/ReadingProgress";
import { ShareWidget } from "../components/ShareWidget";
import { ArticleTOC, slugify } from "../components/ArticleTOC";
import { getFallbackImage, getSecondaryFallback } from "../lib/fallback-image";

// Loading skeleton for dynamic articles
const ArticleSkeleton = () => (
  <div className="bg-[#050505] text-white animate-pulse">
    <div className="relative w-full h-[92vh] min-h-[640px] bg-zinc-900" />
    <div className="max-w-3xl mx-auto px-6 md:px-0 pt-20 space-y-8">
      <div className="h-6 w-32 bg-zinc-800 rounded" />
      <div className="h-12 w-3/4 bg-zinc-800 rounded" />
      <div className="h-4 bg-zinc-800 rounded" />
      <div className="h-4 bg-zinc-800 rounded" />
      <div className="h-4 w-2/3 bg-zinc-800 rounded" />
    </div>
  </div>
);

function normalizeArticle(a) {
  if (!a) return null;

  // Split AI report content into paragraphs
  const rawParagraphs = (a.aiContent || a.content || "")
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  // Guarantee minimum of 3 paragraphs
  while (rawParagraphs.length < 3) {
    rawParagraphs.push("Leonida Vice intelligence units are actively tracking additional signals and verifying field intelligence for this report. Further telemetry briefings will be logged as details surface.");
  }

  // Construct structured layout blocks (3 paragraphs + 2 images)
  const bodyBlocks = [];
  
  // 1. Lead paragraph
  bodyBlocks.push({
    type: "lead",
    text: a.aiSummary || a.excerpt || "Intel report pending."
  });

  // 2. First paragraph
  bodyBlocks.push({
    type: "p",
    text: rawParagraphs[0]
  });

  // 3. First Image Block (Primary Hero/Thumbnail image)
  bodyBlocks.push({
    type: "image",
    src: a.heroImage || a.imageThumbnail || getFallbackImage(a.category, a.id),
    caption: `Scraper intel: Verified capture matching ${a.category || 'Leonida'} tracking logs.`
  });

  // 4. Second paragraph
  bodyBlocks.push({
    type: "p",
    text: rawParagraphs[1]
  });

  // 5. Second Image Block (Secondary cinematic shot!)
  bodyBlocks.push({
    type: "image",
    src: getSecondaryFallback(a.id),
    caption: "Cinematic broadcast slice capturing the state of Leonida."
  });

  // 6. Third paragraph & any remaining ones
  for (let i = 2; i < rawParagraphs.length; i++) {
    bodyBlocks.push({
      type: "p",
      text: rawParagraphs[i]
    });
  }

  return {
    ...a,
    heroImage:  a.heroImage || a.imageThumbnail || a.videoThumbnail || null,
    dek:        a.dek || a.aiSummary || a.excerpt || "",
    date:       a.date || (a.publishedAt || a.approvedAt || a.scrapedAt || "").slice(0, 10),
    author:     a.author || "Leonida Vice",
    readTime:   a.readTime || "2 min read",
    category:   a.category || "Intel",
    slug:       a.slug || "",
    body:       a.body && a.body.length > 0 ? a.body : bodyBlocks
  };
}

const Article = () => {
  const { slug } = useParams();
  const staticArticle = getArticle(slug);

  const [article, setArticle] = useState(staticArticle ? normalizeArticle(staticArticle) : null);
  const [loading, setLoading] = useState(!staticArticle);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (staticArticle) return; // already resolved from static data
    setLoading(true);
    api.article(slug).then((data) => {
      if (!data) {
        setNotFound(true);
      } else {
        setArticle(normalizeArticle(data));
      }
      setLoading(false);
    });
  }, [slug, staticArticle]);

  if (loading) return <ArticleSkeleton />;
  if (notFound || (!loading && !article)) return <Navigate to="/news" replace />;

  const idx = articles.findIndex((a) => a.slug === article.slug);
  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;
  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article data-testid="article-page" className="bg-[#050505] text-white">
      <ReadingProgress />

      {/* HERO — GameSpot-style full-bleed editorial */}
      <section
        data-testid="article-hero"
        className="relative w-full h-[92vh] min-h-[640px] flex items-end overflow-hidden scanline vignette"
      >
        <div className="absolute inset-0 z-0 grain">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover object-center"
            style={{ objectPosition: "center 30%" }}
          />
        </div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050505] via-[#050505]/55 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />

        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-24 pt-32">
          <Link
            to="/news"
            data-testid="article-back-link"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300 hover:text-white mb-8"
          >
            <ArrowLeft size={14} /> Back to Newsroom
          </Link>
          <div className="flex items-center gap-3 mb-5">
            <span className="font-display text-xs tracking-[0.35em] uppercase text-white bg-[#FF2A6D] px-3 py-1.5">
              {article.category}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-200">
              № {String(idx + 1).padStart(2, "0")}
            </span>
          </div>
          <h1 className="font-editorial text-4xl md:text-7xl text-white leading-[1.02] max-w-5xl">
            {article.title}
          </h1>
          <p className="mt-6 font-editorial italic text-xl md:text-2xl text-zinc-200 max-w-3xl leading-snug">
            {article.dek}
          </p>

          {/* Byline strip */}
          <div className="mt-10 flex flex-wrap items-center gap-5 pt-6 border-t border-white/15 max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="h-10 w-10 rounded-full grid place-items-center font-display text-base text-white"
                style={{
                  background: "linear-gradient(135deg, #FF2A6D 0%, #FF7B00 100%)",
                }}
              >
                {article.author
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <div className="leading-tight">
                <div className="text-sm text-white">{article.author}</div>
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-400">
                  {article.date}
                </div>
              </div>
            </div>
            <span className="h-6 w-px bg-white/15 hidden sm:block" />
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-zinc-300">
              <Clock size={13} /> {article.readTime}
            </div>
          </div>
        </div>
      </section>

      {/* BODY — narrow editorial column with full-bleed image escapes */}
      <section className="relative pt-20 pb-10">
        <div className="article-prose max-w-3xl mx-auto px-6 md:px-0">
          {(article.body || []).map((block, i) => {
            if (block.type === "lead") {
              return (
                <p
                  key={i}
                  data-testid={`article-block-lead-${i}`}
                  className="drop-cap text-xl md:text-2xl leading-[1.6] text-zinc-100 font-editorial mb-10"
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "p") {
              return (
                <p
                  key={i}
                  className="text-lg md:text-xl leading-[1.75] text-zinc-300 font-body mb-8"
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === "h2") {
              return (
                <h2
                  key={i}
                  id={slugify(block.text)}
                  className="font-display uppercase text-3xl md:text-4xl text-white tracking-[0.02em] mt-16 mb-6 scroll-mt-32"
                >
                  <span className="inline-block border-l-4 border-[#FF2A6D] pl-4">
                    {block.text}
                  </span>
                </h2>
              );
            }
            if (block.type === "pull") {
              return (
                <blockquote
                  key={i}
                  className="relative my-16 px-6 md:px-10 py-10 border-y border-white/10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 left-6 md:left-10 font-editorial text-6xl text-[#FF2A6D] leading-none"
                  >
                    “
                  </span>
                  <p className="font-editorial italic text-2xl md:text-4xl text-white leading-[1.2]">
                    {block.text}
                  </p>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-8 right-6 md:right-10 font-editorial text-6xl text-[#FF2A6D] leading-none"
                  >
                    ”
                  </span>
                </blockquote>
              );
            }
            if (block.type === "image") {
              return (
                <figure key={i} className="my-16 full-bleed">
                  {block.caption && (
                    <figcaption className="max-w-3xl mx-auto px-6 md:px-0 mb-5 text-xs uppercase tracking-[0.25em] text-zinc-400 border-l-2 border-[#FF2A6D] pl-3">
                      {block.caption}
                    </figcaption>
                  )}
                  <div className="relative h-[60vh] md:h-[80vh] min-h-[420px] max-h-[860px] overflow-hidden">
                    <img
                      src={block.src}
                      alt={block.caption || ""}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: "center 40%" }}
                    />
                    {/* Subtle vignette so the image holds focus */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/15 pointer-events-none" />
                  </div>
                </figure>
              );
            }
            return null;
          })}

          {/* Tags + inline share */}
          <div className="mt-20 pt-10 border-t border-white/10 space-y-8">
            {article.tags && (
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mr-2 self-center">
                  Filed Under
                </span>
                {article.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-[0.25em] text-zinc-200 border border-white/15 px-3 py-1 rounded-full hover:border-[#FF2A6D] hover:text-white transition cursor-default"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            <ShareWidget variant="inline" title={article.title} text={article.dek} />
          </div>
        </div>
      </section>

      {/* PREV / NEXT navigation */}
      <section className="border-t border-white/10 py-10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-6">
          {prev ? (
            <Link
              to={`/news/${prev.slug}`}
              data-testid="article-prev-link"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition p-6 flex gap-5 items-center"
            >
              <div className="relative w-28 h-20 flex-none overflow-hidden rounded-md">
                <img
                  src={prev.heroImage}
                  alt={prev.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 inline-flex items-center gap-2">
                  <ArrowLeft size={12} /> Previous
                </div>
                <div className="font-editorial text-lg md:text-xl text-white leading-snug line-clamp-2 mt-1">
                  {prev.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              to={`/news/${next.slug}`}
              data-testid="article-next-link"
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition p-6 flex gap-5 items-center md:flex-row-reverse text-right md:text-right"
            >
              <div className="relative w-28 h-20 flex-none overflow-hidden rounded-md">
                <img
                  src={next.heroImage}
                  alt={next.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 inline-flex items-center gap-2 md:justify-end">
                  Next <ArrowRight size={12} />
                </div>
                <div className="font-editorial text-lg md:text-xl text-white leading-snug line-clamp-2 mt-1">
                  {next.title}
                </div>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </section>

      {/* RELATED */}
      <section className="border-t border-white/5 py-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-10">
            Continue Reading
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {related.map((r) => (
              <Link
                key={r.slug}
                to={`/news/${r.slug}`}
                data-testid={`article-related-${r.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/5 mb-4">
                  <img
                    src={r.heroImage}
                    alt={r.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF2A6D] font-semibold">
                  {r.category}
                </span>
                <h3 className="font-editorial text-2xl text-white leading-tight mt-2 group-hover:text-[#FF2A6D] transition">
                  {r.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
};

export default Article;
