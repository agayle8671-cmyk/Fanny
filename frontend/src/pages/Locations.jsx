import { Link } from "react-router-dom";
import { locations } from "../data/locations";

const Locations = () => {
  const cityDistricts = locations.filter((l) =>
    l.region.startsWith("Vice City"),
  );
  const stateRegions = locations.filter(
    (l) => !l.region.startsWith("Vice City"),
  );

  return (
    <div data-testid="locations-page" className="bg-[#050505] text-white pt-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <header className="mb-16 max-w-3xl">
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] mb-4 font-semibold">
            The Atlas
          </p>
          <h1 className="font-display uppercase text-6xl md:text-8xl leading-[0.9] text-white">
            State of Leonida
          </h1>
          <p className="mt-6 font-editorial italic text-xl text-zinc-300 max-w-2xl">
            Six districts of Vice City. Six counties beyond. Roughly two-and-a-half
            times the size of Los Santos.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
            Vice City — The Urban Core
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cityDistricts.map((l) => (
              <Link
                key={l.slug}
                to={`/locations/${l.slug}`}
                data-testid={`location-grid-item-${l.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/5 mb-4">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute bottom-0 p-5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold">
                      District
                    </span>
                    <h3 className="font-display text-3xl text-white leading-none mt-1">
                      {l.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2">{l.tagline}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="pb-24">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
            Beyond the City — The Counties
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stateRegions.map((l) => (
              <Link
                key={l.slug}
                to={`/locations/${l.slug}`}
                data-testid={`location-grid-item-${l.slug}`}
                className="group block"
              >
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-white/5 mb-4">
                  <img
                    src={l.image}
                    alt={l.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute bottom-0 p-5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#FF7B00] font-semibold">
                      {l.region.replace("State of Leonida — ", "")}
                    </span>
                    <h3 className="font-display text-3xl text-white leading-none mt-1">
                      {l.name}
                    </h3>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2">{l.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Locations;
