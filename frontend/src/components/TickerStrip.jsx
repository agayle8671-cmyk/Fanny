// Auto-scrolling breaking-news ticker that lives above the navbar.
// Headlines are short, urgent, fully GTA-canon.
import { Zap } from "lucide-react";

const DEFAULT_HEADLINES = [
  "GTA VI launches November 19, 2026 on PS5 & Xbox Series X|S",
  "State of Leonida confirmed at 2–2.5× the size of Los Santos",
  "Dual protagonists Jason Duval & Lucia Caminos officially playable",
  "Phil Cassidy returns in HD-Universe reinterpretation — both arms intact",
  "RAGE Engine targeting 30 FPS with Ray-Traced Global Illumination on base PS5",
  "Relationship Bar mechanic tracks Jason & Lucia bond in real time",
  "ShinyHunters claim 78.6M record breach — Rockstar calls it 'non-material'",
  "Mount Kalaga National Park positioned to host next Chiliad-style mythology",
  "Systemic robbery system introduces CCTV detection and surrender timers",
  "Tom Petty's 'Love Is a Long Road' confirmed for the in-game soundtrack",
];

export const TickerStrip = ({ headlines = DEFAULT_HEADLINES }) => {
  const list = [...headlines, ...headlines];
  return (
    <div
      data-testid="breaking-news-ticker"
      className="relative w-full overflow-hidden bg-black border-b border-white/10"
    >
      <div className="flex items-stretch h-8">
        {/* Sticky LIVE label */}
        <div className="flex-none inline-flex items-center gap-2 px-4 bg-[#FF2A6D] text-white text-[10px] font-bold uppercase tracking-[0.3em]">
          <Zap size={12} className="animate-pulse" fill="white" />
          Live Wire
        </div>
        {/* Scrolling rail */}
        <div className="relative flex-1 overflow-hidden">
          <div className="flex items-center whitespace-nowrap animate-marquee h-full">
            {list.map((h, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-3 px-6 text-[11px] uppercase tracking-[0.18em] text-zinc-200"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: i % 2 === 0 ? "#FF2A6D" : "#05D9E8" }}
                />
                {h}
              </span>
            ))}
          </div>
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black to-transparent" />
        </div>
      </div>
    </div>
  );
};
