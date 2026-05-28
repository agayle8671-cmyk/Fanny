import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getCharacter, characters } from "../data/characters";

const CharacterDetail = () => {
  const { slug } = useParams();
  const character = getCharacter(slug);

  if (!character) return <Navigate to="/characters" replace />;

  const related = character.relatedCharacters
    .map((s) => characters.find((c) => c.slug === s))
    .filter(Boolean);

  return (
    <div data-testid="character-detail-page" className="bg-[#050505] text-white">
      {/* HERO */}
      <section className="relative w-full h-[78vh] min-h-[540px] flex items-end overflow-hidden">
        <div className="absolute inset-0 z-0 grain">
          <img
            src={character.coverImage}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-10 hero-overlay" />
        <div className="absolute inset-0 z-10 side-overlay" />
        <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-16 pt-32">
          <Link
            to="/characters"
            data-testid="character-back-link"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-300 hover:text-white mb-6"
          >
            <ArrowLeft size={14} /> Back to Cast
          </Link>
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#05D9E8] font-semibold">
            {character.role}
          </span>
          <h1 className="font-display text-6xl md:text-9xl uppercase text-white leading-[0.85] mt-3 vice-glow">
            {character.name}
          </h1>
          <p className="font-editorial italic text-xl md:text-2xl text-zinc-200 mt-4 max-w-2xl">
            {character.tagline}
          </p>
        </div>
      </section>

      {/* IMDB-STYLE DATA */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 py-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left rail */}
        <aside className="lg:col-span-4 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold mb-4">
              Quick Facts
            </p>
            <dl className="border-t border-white/10">
              {character.facts.map((f) => (
                <div
                  key={f.label}
                  className="border-b border-white/10 py-4 flex flex-col sm:flex-row gap-2"
                >
                  <dt className="text-zinc-500 uppercase tracking-[0.2em] text-[11px] sm:w-44 font-semibold">
                    {f.label}
                  </dt>
                  <dd className="text-white text-sm flex-1">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {character.abilities && character.abilities.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold mb-4">
                Signature Abilities
              </p>
              <ul className="space-y-2">
                {character.abilities.map((a) => (
                  <li
                    key={a}
                    className="text-sm text-white border-l-2 border-[#FF2A6D] pl-4 py-1"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main className="lg:col-span-8 space-y-10">
          <div>
            <h2 className="font-display uppercase text-3xl md:text-4xl text-white mb-6">
              Biography
            </h2>
            <p className="font-editorial text-lg md:text-xl leading-[1.7] text-zinc-200">
              {character.bio}
            </p>
          </div>

          {character.quote && (
            <blockquote className="border-l-4 border-[#05D9E8] pl-6 py-2">
              <p className="font-editorial italic text-2xl md:text-3xl text-white leading-tight">
                &ldquo;{character.quote}&rdquo;
              </p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mt-3">
                — {character.name}
              </p>
            </blockquote>
          )}

          {related.length > 0 && (
            <div className="border-t border-white/5 pt-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-semibold mb-6">
                Connected Characters
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/characters/${r.slug}`}
                    data-testid={`character-related-${r.slug}`}
                    className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/10"
                  >
                    <img
                      src={r.image}
                      alt={r.name}
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute bottom-0 p-3">
                      <p className="text-[9px] uppercase tracking-[0.25em] text-[#05D9E8]">
                        {r.role}
                      </p>
                      <p className="font-display text-lg text-white leading-none">
                        {r.name}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default CharacterDetail;
