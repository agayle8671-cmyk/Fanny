import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div
      data-testid="not-found-page"
      className="relative min-h-screen bg-[#050505] text-white overflow-hidden scanline"
    >
      <div className="absolute inset-0 z-0 opacity-30">
        <img
          src="https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#050505]/85 to-[#050505] z-10" />
      <div className="relative z-20 min-h-screen flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-10 items-center w-full">
          <div className="md:col-span-7">
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#FF2A6D] font-semibold">
              Signal Lost
            </p>
            <h1
              className="font-display uppercase text-[10rem] md:text-[16rem] leading-[0.8] mt-4 vice-glow"
              style={{
                background:
                  "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              404
            </h1>
            <h2 className="font-editorial text-3xl md:text-5xl text-white leading-tight mt-6">
              This page is somewhere off the map.
            </h2>
            <p className="font-editorial italic text-zinc-300 text-lg md:text-xl mt-5 max-w-xl">
              Maybe it's in the Grassrivers. Maybe Cal Hampton hid it on his houseboat. Either
              way, it isn't here.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/"
                data-testid="not-found-home-link"
                className="inline-flex items-center gap-3 px-7 py-4 bg-[#FF2A6D] text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-[#FF7B00] transition-colors duration-300"
              >
                <ArrowLeft size={16} /> Back to Leonida
              </Link>
              <Link
                to="/news"
                data-testid="not-found-news-link"
                className="inline-flex items-center gap-3 px-7 py-4 border border-white/30 text-white font-semibold tracking-[0.25em] text-xs uppercase rounded-sm hover:bg-white hover:text-black transition-colors duration-300"
              >
                Open the Newsroom
              </Link>
            </div>
          </div>
          <aside className="md:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">
                Last Known Coordinates
              </p>
              <dl className="space-y-3 text-sm">
                {[
                  ["Status", "Off-Grid"],
                  ["Region", "Unknown"],
                  ["Signal", "0%"],
                  ["Heading", "Vice City"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-white/5 pb-2">
                    <dt className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                      {k}
                    </dt>
                    <dd className="font-mono text-white text-sm">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2 border-t border-white/5">
                If you got here from a saved link, the article may have moved. Try the{" "}
                <Link to="/news" className="text-white underline underline-offset-4">
                  Newsroom
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
