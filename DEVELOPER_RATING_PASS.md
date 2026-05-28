# Leonida Vice — Developer Rating Pass

A self-honest audit of the build. Pretending I don't know who built it, what tells me "AI generated this" vs "a developer made decisions here"?

## ✅ What now reads as developer-built (after this pass)

1. **Routing has a custom 404** with personality (Cal Hampton, the Grassrivers — actual lore-flavored copy, not "Page Not Found").
2. **The Live Wire ticker** is wired to a real API endpoint that polls every 60 seconds for trending content. Fallback headlines exist for when the API is empty. That's a real developer pattern — graceful degradation.
3. **Article TOC** (sticky right-rail on `xl+`) generated from H2 blocks, with scroll-spy that highlights the active section. Smooth-scroll on anchor clicks. This is the single biggest "GameSpot / NYT" tell I added — AI almost never builds these.
4. **Markets page uses monospace numerals + actual SVG sparklines** drawn from data arrays — not stock chart images. The hover-row pattern, sector labels, and Δ-Day formatting all read like a real trading dashboard.
5. **Open Graph image generator** at `/api/og/countdown.png` — a real backend that renders PNG via Pillow with the live countdown number. The OG meta tags in `index.html` point to it. Every shared link is now a self-updating billboard. That's a developer move.
6. **Backend ingest endpoint** has Bearer-token auth, idempotent upsert by slug, and proper error codes (401 missing / 403 wrong). Production-shaped.
7. **Footer live status pill** polls `/api/articles?limit=1` every 2 minutes and shows "Newswire live · 28 filed · last 5h ago" or "Newswire warming up" — a real, useful indicator of the scraper's health.
8. **Trailer modal** now handles **ESC key** and locks body scroll while open (proper a11y).
9. **Article H2s have stable IDs** (slugified) so deep-links into specific sections work — a real CMS-shaped detail.
10. **Custom scrollbar styling** + section anchor scroll-mt offsets so anchored links land below the fixed header.
11. **Seed script** (`/app/scripts/seed_newswire.py`) hits localhost to bypass the Cloudflare WAF that fronts the preview env — a real ops decision a developer would make.
12. **Weapon cards got a duotone treatment** (pink → cyan gradient + grid schematic overlay) — turns stock photos into branded technical-spec cards. The grayscale → color hover is a deliberate brand-aligned interaction, not a Tailwind default.

## ⚠️ What still has AI-tells (honest)

1. **The Unsplash weapon photos** are still generic firearms. A real fan site would have transparent renders, schematic line drawings, or commissioned art. The duotone wash hides the worst of it, but it isn't a full fix.
2. **All the character avatars use stock photos** (a guy in a beanie isn't actually Boobie Ike). A real fan site would have either commissioned art, blurred placeholder silhouettes, or — better — clearly framed "artist's interpretation" / "rumored cast" badges. Currently they read as the canon characters, which is technically misleading.
3. **Some inline article images use the same neutral palms/cityscape stock photos** repeatedly. A developer with art direction would have a much tighter library — at minimum 2-3 candidates per article rather than reusing the same six images.
4. **The "By The Numbers" bento grid has large empty middle space in the lg cells.** Editorial breathing room is one read; visual gap is another. A designer would put a sparkline, a glyph, or a secondary stat in that space.
5. **No microcopy variation in card hover states.** Every card scales `1.03` with the same accent line draw. Real designers vary timing curves and accent colors per content type.
6. **The Soundtrack page doesn't have any audio.** A real fan site for a music-driven franchise would have at least waveform placeholders or "preview unavailable" speakers — something acknowledging the gap.
7. **Mobile experience is solid but plain.** The masthead micro-strip + Live Wire ticker are desktop-only. A mobile-first designer would have collapsed the ticker into a marquee carousel rather than hiding it.
8. **The article tags are decorative.** They look clickable but don't filter. A developer would either wire them up or remove the affordance.
9. **No skeletons on home rails.** Intel has skeletons, the rest pop in.

## Honest verdict

Out of 10 for "would a senior developer have built this?":
- **Phase 1 (the initial build):** ~5.5/10 — clearly AI, well-styled but generic.
- **Phase 2 (carousel + bento + share + design doc):** ~7/10 — starting to feel intentional.
- **Phase 3 (full-bleed images + share widget):** ~7.5/10.
- **Phase 4 (scraper integration + Newswire):** ~8/10 — the backend architecture and the two-lane editorial/newswire split is a real product decision.
- **Phase 5 (this pass — Markets + 404 + TOC + OG + Live Wire wired):** **~8.5/10**.

To clear 9/10 you'd need: commissioned character art (or honest "artist interpretation" badges), a tighter custom image library, a real interactive Leonida map, and either an in-house audio system on Soundtrack or graceful "preview unavailable" affordances.

## Recommended next moves
1. **Replace character stock photos** with either AI-generated portraits stylized to a single art-direction OR add "Artist's interpretation" badges to acknowledge what they are.
2. **Bento grid fill** — drop sparklines or supporting glyphs into the large cells.
3. **Tag-as-filter** wiring on `/news` so the editorial tags actually do something.
4. **Mobile Live Wire** — a swipeable carousel of headlines, not just a hidden component.
5. **Loading skeletons** on every home rail to match `/intel`.
