import { Link } from "react-router-dom";

export const ArticleCard = ({ article, size = "default" }) => {
  const tall = size === "tall";
  return (
    <Link
      to={`/news/${article.slug}`}
      data-testid={`article-card-${article.slug}`}
      className={`group relative flex-none snap-start overflow-hidden rounded-lg border border-white/5 bg-zinc-900 transition-all duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-pink-500/20 ${
        tall ? "w-[320px] md:w-[360px] aspect-[3/4]" : "w-[300px] md:w-[360px] aspect-[16/10]"
      }`}
    >
      <img
        src={article.heroImage}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <span className="inline-block self-start text-[10px] uppercase tracking-[0.25em] text-[#FF2A6D] font-semibold mb-2">
          {article.category}
        </span>
        <h3 className="font-editorial text-xl md:text-2xl text-white leading-tight line-clamp-3">
          {article.title}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-3 text-xs text-zinc-300 line-clamp-2">
          {article.dek}
        </div>
        <div className="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          <span>{article.author}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-600" />
          <span>{article.readTime}</span>
        </div>
      </div>
    </Link>
  );
};
