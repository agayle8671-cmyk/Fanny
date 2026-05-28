import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getLocation, locations } from "../data/locations";

const LocationDetail = () => {
  const { slug } = useParams();
  const location = getLocation(slug);

  if (!location) return <Navigate to="/locations" replace />;

  const related = (location.relatedLocations || [])
    .map((s) => locations.find((l) => l.slug === s))
    .filter(Boolean);

  return (
    <div data-testid="location-detail-page" className="bg-[#050505] text-white">
      <section className="relative w-full h-[80vh] min-h-[540px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 grain">
          <img
            src={location.coverImage}
            alt={location.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 hero-overlay" />
        <div className="relative z-20 max-w-[1400px] mx-auto px-6 md:px-12 pb-16 pt-32">
          <Link
            to="/locations"
            data-testid="location-back-link"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300 hover:text-white mb-6"
          >
            <ArrowLeft size={14} /> Back to Atlas
          </Link>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#05D9E8] font-semibold">
            {location.region}
          </span>
          <h1 className="font-display uppercase text-6xl md:text-9xl text-white leading-[0.85] mt-3 vice-glow">
            {location.name}
          </h1>
          <p className="font-editorial italic text-xl md:text-2xl text-zinc-200 mt-5 max-w-3xl">
            {location.tagline}
          </p>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 grid lg:grid-cols-12 gap-12">
        <main className="lg:col-span-8 space-y-8">
          <h2 className="font-display uppercase text-3xl md:text-4xl text-white">
            Overview
          </h2>
          <p className="font-editorial text-lg md:text-xl leading-[1.7] text-zinc-200">
            {location.description}
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Real-world analog: <span className="text-white">{location.analog}</span>
          </p>
        </main>
        <aside className="lg:col-span-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold mb-4">
            District Brief
          </p>
          <dl className="border-t border-white/10">
            {location.facts.map((f) => (
              <div key={f.label} className="border-b border-white/10 py-4">
                <dt className="text-zinc-500 uppercase tracking-[0.2em] text-[11px] font-semibold">
                  {f.label}
                </dt>
                <dd className="text-white text-sm mt-1">{f.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {related.length > 0 && (
        <section className="border-t border-white/5 py-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-8">
              Nearby
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  to={`/locations/${r.slug}`}
                  data-testid={`location-related-${r.slug}`}
                  className="group block relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10"
                >
                  <img
                    src={r.image}
                    alt={r.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 hero-overlay" />
                  <div className="absolute bottom-0 p-5">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold">
                      {r.region}
                    </span>
                    <h3 className="font-display text-2xl text-white leading-none mt-1">
                      {r.name}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default LocationDetail;
