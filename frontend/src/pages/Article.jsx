import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getArticle, articles } from "../data/articles";

const Article = () => {
  const { slug } = useParams();
  const article = getArticle(slug);

  if (!article) return <Navigate to="/news" replace />;

  const related = articles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <article data-testid="article-page" className="bg-[#050505] text-white">
      {/* HERO */}
      <section
        data-testid="article-hero"
        className="relative w-full h-[88vh] min-h-[600px] flex items-end overflow-hidden scanline"
      >
        <div className="absolute inset-0 z-0 grain">
          <img
            src={article.heroImage}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 hero-overlay" />
        <div className="relative z-20 w-full max-w-5xl mx-auto px-6 md:px-12 pb-20 pt-32">
          <Link
            to="/news"
            data-testid="article-back-link"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300 hover:text-white mb-6"
          >
            <ArrowLeft size={14} /> Back to Newsroom
          </Link>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#FF2A6D] font-semibold">
            {article.category}
          </span>
          <h1 className="font-editorial text-4xl md:text-7xl text-white leading-[1.05] mt-4 max-w-4xl">
            {article.title}
          </h1>
          <p className="mt-6 font-editorial italic text-xl md:text-2xl text-zinc-200 max-w-3xl leading-snug">
            {article.dek}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.28em] text-zinc-400">
            <span className="text-white">{article.author}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span>{article.date}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-600" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="max-w-3xl mx-auto px-6 md:px-0 py-20">
        {article.body.map((block, i) => {
          if (block.type === "lead") {
            return (
              <p
                key={i}
                data-testid={`article-block-lead-${i}`}
                className="drop-cap text-xl md:text-2xl leading-[1.6] text-zinc-200 font-editorial mb-10"
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
                className="font-display uppercase text-3xl md:text-4xl text-white tracking-[0.02em] mt-14 mb-6"
              >
                {block.text}
              </h2>
            );
          }
          if (block.type === "pull") {
            return (
              <blockquote
                key={i}
                className="relative my-14 pl-8 border-l-4 border-[#FF2A6D]"
              >
                <p className="font-editorial italic text-2xl md:text-4xl text-white leading-tight">
                  &ldquo;{block.text}&rdquo;
                </p>
              </blockquote>
            );
          }
          if (block.type === "image") {
            return (
              <figure key={i} className="my-14 -mx-6 md:-mx-20">
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={block.src}
                    alt={block.caption || ""}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                {block.caption && (
                  <figcaption className="mt-3 text-xs uppercase tracking-[0.22em] text-zinc-500 text-center">
                    {block.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          return null;
        })}

        {/* Tags */}
        {article.tags && (
          <div className="mt-16 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] uppercase tracking-[0.25em] text-zinc-300 border border-white/15 px-3 py-1 rounded-full"
              >
                {t}
              </span>
            ))}
          </div>
        )}
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
