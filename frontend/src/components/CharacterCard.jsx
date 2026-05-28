import { Link } from "react-router-dom";

export const CharacterCard = ({ character }) => {
  return (
    <Link
      to={`/characters/${character.slug}`}
      data-testid={`character-card-${character.slug}`}
      className="group relative flex-none snap-start w-[230px] md:w-[260px] aspect-[2/3] overflow-hidden rounded-md border border-white/5 bg-zinc-900 transition-all duration-300 hover:scale-[1.04] hover:z-10 hover:shadow-2xl hover:shadow-pink-500/20"
    >
      <img
        src={character.image}
        alt={character.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[#05D9E8] font-semibold mb-1">
          {character.role}
        </span>
        <h3 className="font-display text-2xl text-white leading-none">
          {character.name}
        </h3>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2 text-xs text-zinc-300 line-clamp-2">
          {character.tagline}
        </div>
      </div>
    </Link>
  );
};
