import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer
      data-testid="site-footer"
      className="border-t border-white/10 bg-[#050505] mt-24"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-2">
          <div className="flex items-center gap-2">
            <span
              className="font-display text-3xl tracking-[0.04em]"
              style={{
                background: "linear-gradient(90deg, #FF2A6D 0%, #FF7B00 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              LEONIDA
            </span>
            <span className="font-display text-3xl tracking-[0.04em] text-white">
              VICE
            </span>
          </div>
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-md">
            The unofficial fan network for Grand Theft Auto VI. Editorial, character
            archives, location guides, and the most anticipated countdown of the decade.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.25em] text-zinc-600">
            Not affiliated with Rockstar Games or Take-Two Interactive.
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Explore
          </p>
          <ul className="space-y-3 text-sm">
            <li><Link to="/news" className="text-zinc-300 hover:text-white">News</Link></li>
            <li><Link to="/intel" className="text-zinc-300 hover:text-white">Live Intel</Link></li>
            <li><Link to="/characters" className="text-zinc-300 hover:text-white">Characters</Link></li>
            <li><Link to="/locations" className="text-zinc-300 hover:text-white">Locations</Link></li>
            <li><Link to="/vehicles" className="text-zinc-300 hover:text-white">Vehicles</Link></li>
            <li><Link to="/arsenal" className="text-zinc-300 hover:text-white">Arsenal</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Media
          </p>
          <ul className="space-y-3 text-sm">
            <li><Link to="/trailers" className="text-zinc-300 hover:text-white">Trailers</Link></li>
            <li><Link to="/soundtrack" className="text-zinc-300 hover:text-white">Soundtrack</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-4">
            Release
          </p>
          <ul className="space-y-3 text-sm">
            <li className="text-zinc-300">Nov 19, 2026</li>
            <li className="text-zinc-300">PS5 · Xbox Series X|S</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 py-6 text-center text-[11px] uppercase tracking-[0.25em] text-zinc-600">
        © {new Date().getFullYear()} Leonida Vice — A Fan-Made Tribute to Grand Theft Auto VI
      </div>
    </footer>
  );
};
