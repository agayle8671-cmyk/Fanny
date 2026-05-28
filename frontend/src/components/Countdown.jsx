import { useEffect, useState } from "react";
import { gameInfo } from "../data/gameInfo";

const calc = () => {
  const diff = new Date(gameInfo.releaseDate).getTime() - Date.now();
  if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
  return {
    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
    m: Math.floor((diff / (1000 * 60)) % 60),
    s: Math.floor((diff / 1000) % 60),
    done: false,
  };
};

export const Countdown = ({ compact = false }) => {
  const [t, setT] = useState(calc());

  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, []);

  const cells = [
    { label: "Days", value: t.d },
    { label: "Hours", value: t.h },
    { label: "Mins", value: t.m },
    { label: "Secs", value: t.s },
  ];

  if (compact) {
    return (
      <div
        data-testid="countdown-compact"
        className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-zinc-300"
      >
        <span className="h-2 w-2 rounded-full bg-[#FF2A6D] pulse-dot" />
        <span>
          {t.d}d · {t.h}h · {t.m}m · {t.s}s until launch
        </span>
      </div>
    );
  }

  return (
    <div data-testid="countdown-block" className="grid grid-cols-4 gap-3 md:gap-5 max-w-2xl">
      {cells.map((c) => (
        <div
          key={c.label}
          className="bg-white/[0.03] border border-white/10 rounded-md p-4 md:p-6 text-center backdrop-blur-sm"
        >
          <div
            className="font-display text-4xl md:text-6xl text-white leading-none"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {String(c.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-zinc-400 mt-2">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
};
