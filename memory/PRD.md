# Leonida Vice — Product Requirements

## Original Problem Statement
> "GTA 6 fansite called leonida vice ... Netflix / IMDb / gamespot clone website ... spectacular ... beautiful editorial style of gamespot articles ... beautiful card designs of Netflix and the data density of IMDb ... seed data everywhere ... every page should be a standalone page that is fully fleshed out ... the article styling is arguably the most important part of my website"

## Architecture
- **Stack:** React 19 + react-router-dom v7 + Tailwind + craco; FastAPI + Mongo (Motor).
- **Theme:** Tropical Noir — `#050505` background, Bebas Neue / Playfair Display / Outfit fonts, vice-pink + cyan-edge + sunset-orange palette.
- **Routing:** `/`, `/news`, `/news/:slug`, `/characters`, `/characters/:slug`, `/locations`, `/locations/:slug`, `/vehicles`, `/arsenal`, `/intel`, `/trailers`, `/soundtrack`.
- **Two content lanes:**
  - **Editorial** — handwritten long-form pieces stored in `/app/frontend/src/data/articles.js`, rendered through the GameSpot-style `Article.jsx` template.
  - **Newswire / Intel** — real-time scraped articles ingested into Mongo via `/api/articles/ingest`, displayed on the home rail + `/intel` page with source attribution and external link-outs.

## What's Been Implemented
### Phase 1 (initial MVP)
- 10 fully-fleshed pages: Home, News, Article, Characters, CharacterDetail, Locations, LocationDetail, Vehicles, Trailers, Soundtrack.
- Seed data: 6 long-form articles, 11 characters, 13 locations, 21 vehicles, 4 trailers, 9 songs/stations.
- GameSpot-style article template with full-bleed hero, drop-cap intro, pull quotes, inline images, related articles.

### Phase 2 (UI enhancement pass)
- Rotating hero carousel with Ken Burns zoom + 2.2s crossfade (5 cinematic slides).
- Magazine masthead micro-strip above the navbar ("Vol. 01 · Issue 06 · Feb 2026" + live "Days Until Leonida").
- Vertical edge typography on the hero (rotated, magazine flourish).
- Editorial scrolling marquees between rails.
- "By The Numbers" bento grid (IMDb-style data density).
- "Cover Story · Issue 06" stamp on the featured article + Issue numbering on article cards.

### Phase 3 (share widget + article polish + design doc)
- Three-channel Share Widget: section on Home (Spread The Countdown), inline row in every article, floating bottom-right FAB.
- Reading progress bar pinned to the top of every article (gradient).
- **Full-bleed inline images** (`.full-bleed`) — articles now use viewport-edge images like GameSpot.
- Pull-quote redesign with smart-quote ornaments.
- Prev/Next article navigation cards at the foot of every article.
- "Filed Under" tag row.
- Comprehensive design system doc at `/app/LEONIDA_VICE_DESIGN_SYSTEM.md` (16 sections).

### Phase 4 (scraper integration + Arsenal + Live Wire)
- **Arsenal / Weapons page** at `/arsenal` — 20 weapons across 8 categories, filterable, animated stat bars.
- **Live Wire ticker** at the very top of the navbar — breaking-news scroll with pulsing LIVE WIRE label.
- **Newswire backend** in `/app/backend/server.py`:
  - `POST /api/articles/ingest` (Bearer-token protected via `INGEST_TOKEN` env var). Idempotent upsert by slug.
  - `GET /api/articles?category=&limit=&offset=` paginated feed sorted by publishedAt desc.
  - `GET /api/articles/trending?limit=` top by `newsValueScore` from last 48h with full-history fallback.
  - `GET /api/articles/:slug` single article.
- **NewswireRail** component on home — fetches `/api/articles?limit=12` and renders source-attributed cards with HOT badges for `newsValueScore ≥ 70`.
- **Intel page** at `/intel` — full feed with category filter pills, HOT badges, source link-outs, AI summary preview, comment counts, "Reports Filed" counter, graceful empty state with the ingest API contract example.
- **Two new editorial articles**:
  - "The ShinyHunters Breach: What Got Out, What Got Confirmed" (Investigations, ~10 min read)
  - "Markets Reopen: BAWSAQ, LCN, and the Player Economy of GTA VI" (Markets, ~7 min read)

## Scraper Integration Contract
External scraper POSTs to:
```
POST {REACT_APP_BACKEND_URL}/api/articles/ingest
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json

{
  "articles": [
    {
      "slug": "unique-url-slug",          // required, used as upsert key
      "title": "...",                      // required
      "excerpt": "...",
      "aiSummary": "...",
      "category": "Leaks" | "Tech" | "Story" | "Trailers" | "World" | "Markets",
      "sourceName": "IGN",
      "sourceUrl": "https://...",
      "url": "https://...",
      "imageThumbnail": "https://...",
      "videoThumbnail": "https://...",
      "isVideo": false,
      "newsValueScore": 0-100,             // ≥70 triggers HOT badge
      "commentsCount": 0,
      "publishedAt": "ISO-8601 string",
      "scrapedAt": "ISO-8601 string"
    }
  ]
}
```
`INGEST_TOKEN` is stored in `/app/backend/.env`.

## Prioritized Backlog
- **P1:** Open Graph image generator for shared links (dynamic countdown OG card).
- **P1:** AI "Ask Leonida" lore chatbot (Claude via Groq/Anthropic API key).
- **P2:** Markets / BAWSAQ page (live in-game tickers, mock data).
- **P2:** Interactive SVG/Mapbox map of Leonida.
- **P2:** Newsletter signup → Mongo + Resend.
- **P3:** Per-article author photos & bios.
- **P3:** Community comments.

## Notes
- Backend status_check endpoints retained for compatibility.
- Newswire gracefully degrades to a "warming up" empty state when no scraped articles exist yet.
- All scraper-ingested data is stored in `scraped_articles` Mongo collection, separate from `status_checks`.
