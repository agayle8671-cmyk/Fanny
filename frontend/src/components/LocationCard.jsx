import { Link } from "react-router-dom";

export const LocationCard = ({ location }) => {
  return (
    <Link
      to={`/locations/${location.slug}`}
      data-testid={`location-card-${location.slug}`}
      className="group relative flex-none snap-start w-[300px] md:w-[360px] aspect-[16/10] overflow-hidden rounded-lg border border-white/5 bg-zinc-900 transition-all duration-300 hover:scale-[1.03] hover:z-10 hover:shadow-2xl hover:shadow-cyan-500/20"
    >
      <img
        src={location.image}
        alt={location.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-85 group-hover:opacity-100"
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 p-5 flex flex-col justify-end">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold mb-2">
          {location.region}
        </span>
        <h3 className="font-display text-3xl text-white leading-none">
          {location.name}
        </h3>
        <p className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 text-xs text-zinc-300 line-clamp-2">
          {location.tagline}
        </p>
      </div>
    </Link>
  );
};
