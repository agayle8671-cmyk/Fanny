import { useState } from "react";
import { Twitter, Facebook, Link2, Share2, Check } from "lucide-react";

// Reusable share toolkit. Can render two ways:
//  - variant="section"  → full marketing section for the homepage
//  - variant="inline"   → compact horizontal row for article pages
export const ShareWidget = ({
  variant = "section",
  url,
  title = "Leonida Vice — The GTA VI Fan Archive",
  text = "Counting down to Grand Theft Auto VI · November 19, 2026. Come read the editorial.",
}) => {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "https://leonidavice.com");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${title} — ${text}`);

  const [copied, setCopied] = useState(false);

  const channels = [
    {
      key: "x",
      label: "Post on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      accent: "#FFFFFF",
    },
    {
      key: "facebook",
      label: "Share on Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      accent: "#FFFFFF",
    },
    {
      key: "reddit",
      label: "Post to Reddit",
      icon: Share2,
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`,
      accent: "#FF7B00",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard refused; silently noop
    }
  };

  const tryNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  };

  if (variant === "inline") {
    return (
      <div
        data-testid="share-widget-inline"
        className="flex items-center gap-3 flex-wrap"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
          Share
        </span>
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <a
              key={c.key}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`share-inline-${c.key}`}
              aria-label={c.label}
              className="h-9 w-9 grid place-items-center rounded-full border border-white/15 text-zinc-300 hover:text-white hover:border-[#FF2A6D] hover:bg-[#FF2A6D]/10 transition"
            >
              <Icon size={15} />
            </a>
          );
        })}
        <button
          data-testid="share-inline-copy"
          onClick={copyLink}
          aria-label="Copy link"
          className="h-9 px-4 inline-flex items-center gap-2 rounded-full border border-white/15 text-zinc-300 hover:text-white hover:border-[#FF2A6D] hover:bg-[#FF2A6D]/10 transition text-[11px] uppercase tracking-[0.25em]"
        >
          {copied ? <Check size={14} /> : <Link2 size={14} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    );
  }

  return (
    <section
      data-testid="share-widget-section"
      className="relative py-24 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400"
          alt="Leonida neon"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505] z-10" />

      <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 space-y-5">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] font-semibold">
            Spread the Word
          </p>
          <h2 className="font-display uppercase text-4xl md:text-6xl text-white leading-[0.95]">
            Share the <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Countdown
            </span>
          </h2>
          <p className="font-editorial italic text-lg md:text-xl text-zinc-300 max-w-2xl">
            Drop Leonida Vice into a group chat, a subreddit, a feed. The fastest
            way to make sure the people you know don't miss launch day.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 space-y-5">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-[#FF2A6D] pulse-dot" />
              Share Leonida Vice
            </div>
            <div className="flex flex-col gap-3">
              {channels.map((c) => {
                const Icon = c.icon;
                return (
                  <a
                    key={c.key}
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`share-section-${c.key}`}
                    className="group flex items-center justify-between px-5 py-4 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/[0.05] transition"
                  >
                    <span className="inline-flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">
                      <span
                        className="h-9 w-9 grid place-items-center rounded-full bg-white/5 group-hover:bg-[#FF2A6D]/15 transition"
                        style={{ color: c.accent }}
                      >
                        <Icon size={16} />
                      </span>
                      {c.label}
                    </span>
                    <span className="text-zinc-500 text-xs">↗</span>
                  </a>
                );
              })}

              <button
                data-testid="share-section-copy"
                onClick={copyLink}
                className="group flex items-center justify-between px-5 py-4 rounded-lg border border-white/10 hover:border-[#FF2A6D] hover:bg-[#FF2A6D]/10 transition text-left"
              >
                <span className="inline-flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.22em] text-white">
                  <span className="h-9 w-9 grid place-items-center rounded-full bg-white/5 group-hover:bg-[#FF2A6D]/20 transition">
                    {copied ? <Check size={16} /> : <Link2 size={16} />}
                  </span>
                  {copied ? "Link copied" : "Copy share link"}
                </span>
                <span className="text-zinc-500 text-xs">⌘C</span>
              </button>

              <button
                data-testid="share-section-native"
                onClick={tryNativeShare}
                className="md:hidden inline-flex items-center justify-center gap-3 mt-1 px-5 py-4 rounded-lg bg-[#FF2A6D] text-white font-semibold uppercase text-xs tracking-[0.25em]"
              >
                <Share2 size={16} /> Share via device
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Floating share button — sits bottom-right and triggers native/copy.
export const FloatingShareButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden md:block" data-testid="floating-share">
      {open && (
        <div className="absolute bottom-16 right-0 w-72 rounded-xl border border-white/10 bg-[#0A0A0C]/95 backdrop-blur-xl p-4 shadow-2xl shadow-pink-500/20">
          <ShareWidget variant="inline" />
        </div>
      )}
      <button
        data-testid="floating-share-toggle"
        aria-label="Share this site"
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full grid place-items-center text-white shadow-2xl shadow-pink-500/30 hover:scale-110 transition-transform"
        style={{
          background: "linear-gradient(135deg, #FF2A6D 0%, #FF7B00 100%)",
        }}
      >
        <Share2 size={18} />
      </button>
    </div>
  );
};
