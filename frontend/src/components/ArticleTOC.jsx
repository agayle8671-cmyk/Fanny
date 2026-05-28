import { useEffect, useState } from "react";

// Sticky table of contents that highlights the active H2 as you scroll.
// Generated from the article body blocks.
export const ArticleTOC = ({ blocks }) => {
  const sections = blocks
    .map((b, i) => (b.type === "h2" ? { idx: i, text: b.text, id: slugify(b.text) } : null))
    .filter(Boolean);

  const [active, setActive] = useState(sections[0]?.id || null);

  useEffect(() => {
    if (sections.length === 0) return undefined;
    const onScroll = () => {
      const offset = window.innerHeight * 0.35;
      let current = sections[0].id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top - offset <= 0) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <aside
      data-testid="article-toc"
      className="hidden xl:block fixed right-8 top-[40%] -translate-y-1/2 w-[230px] z-30"
    >
      <p className="text-[10px] uppercase tracking-[0.32em] text-zinc-500 mb-4">
        In This Story
      </p>
      <ul className="space-y-2 border-l border-white/10 pl-4">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              data-testid={`toc-link-${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(s.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className={`block text-[12px] leading-snug transition-colors ${
                active === s.id
                  ? "text-white font-semibold"
                  : "text-zinc-500 hover:text-zinc-200"
              }`}
            >
              <span
                className={`inline-block w-1 h-1 rounded-full mr-2 align-middle ${
                  active === s.id ? "bg-[#FF2A6D]" : "bg-zinc-700"
                }`}
              />
              {s.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
