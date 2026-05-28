import { useEffect, useState } from "react";

// Thin progress bar pinned to the top of the page that tracks vertical scroll.
export const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handler = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = h.scrollHeight - h.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      data-testid="reading-progress"
      className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          background:
            "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
          transition: "width 0.1s linear",
        }}
      />
    </div>
  );
};
