# LEONIDA VICE — Complete UI / UX Design System

> A full blueprint of how the Leonida Vice (GTA VI fan archive) website is structured, styled, and assembled — page by page, component by component. Hand this file to any designer or developer and they can fully recreate or extend the site without guessing.

Version 1.1 · February 2026

---

## 1. Brand Identity

**Project name:** Leonida Vice
**Tagline / function:** A fan-curated editorial archive for Grand Theft Auto VI.
**Voice / tone:** Premium gaming-media — editorial, confident, slightly cinematic. Equal parts GameSpot long-form, Netflix billboard energy, IMDb data density.
**Three-word brand mood:** *Tropical · Noir · Epic.*

### Aesthetic Pillars
1. **Dark first** — `#050505` background. Light text on dark is the default reading environment.
2. **Cinematic full-bleed imagery** — Big imagery. Stretches to viewport edges wherever possible. Treats every page like a film poster.
3. **Editorial typography** — Three-font stack, not one. Display for headlines, serif for editorial body, grotesque for UI.
4. **Magazine flourishes** — Volume/issue labels, drop caps, pull quotes, marquees, vertical-edge typography. These small typographic moments are what separate the site from a generic AI-built fansite.

---

## 2. Color System

| Token | Hex | Where it's used |
|------|------|------|
| `bg.primary` | `#050505` | Page background |
| `bg.secondary` | `#0A0A0C` | Marquee strips, share panel surfaces |
| `bg.surface` | `#121216` | Cards |
| `bg.surface_hover` | `#1C1C22` | Card hover |
| `text.primary` | `#F9F9FA` | Headlines, body |
| `text.secondary` | `#A1A1AA` | Decks, secondary copy |
| `text.muted` | `#71717A` | Captions, metadata |
| `brand.vice_pink` | `#FF2A6D` | Primary CTA, accents, pull-quote borders, hero glow |
| `brand.cyan_edge` | `#05D9E8` | Secondary accent, data callouts, "Welcome to Leonida" |
| `brand.sunset_orange` | `#FF7B00` | Tertiary accent, gradient mid-stop |
| `border.default` | `rgba(255,255,255,0.08)` | Card borders |
| `border.highlight` | `rgba(255,255,255,0.15)` | Hover borders |

### Signature Gradient
```css
linear-gradient(90deg, #FF2A6D 0%, #FF7B00 50%, #05D9E8 100%);
```
Used on: hero headline accent word, logo wordmark, reading progress bar, share section title.

### Glow & Atmospherics
- **`.vice-glow`** — text-shadow with pink halo for hero headlines.
- **`.grain`** — SVG noise overlay (subtle film grain) on hero imagery.
- **`.scanline`** — fine repeating 1-pixel horizontal lines (CRT feel).
- **`.vignette`** — radial darkening at the edges of hero sections.

---

## 3. Typography

### Font Stack
| Family | Role | Loaded via |
|------|------|------|
| **Bebas Neue** | Display headlines, section titles, big numbers, nav UI | Google Fonts |
| **Playfair Display** | Editorial body, deks, pull quotes, drop caps, italic prose | Google Fonts |
| **Outfit** (300–800) | UI body, metadata, small text, buttons | Google Fonts |

All three are imported via a single `@import` at the top of `/app/frontend/src/index.css`.

### Utility classes
- `.font-display` → Bebas Neue
- `.font-editorial` → Playfair Display
- `.font-body` → Outfit (default body)

### Type Scale (Tailwind tokens)
| Use | Class |
|------|------|
| Hero H1 | `text-6xl md:text-8xl lg:text-9xl` (Bebas Neue, uppercase, `leading-[0.85]`) |
| Section H2 | `text-4xl md:text-5xl` (Bebas Neue, uppercase) |
| Article title | `text-4xl md:text-7xl` (Playfair Display, `leading-[1.02]`) |
| Card title | `text-xl md:text-2xl` (Playfair Display) |
| Body prose | `text-lg md:text-xl leading-[1.75]` (Outfit) |
| Lead / drop-cap paragraph | `text-xl md:text-2xl leading-[1.6]` (Playfair Display) |
| Metadata / UI labels | `text-[10–11px] uppercase tracking-[0.22em–0.4em]` (Outfit semibold) |

### Editorial flourishes
- **Drop cap (`.drop-cap`)**: First letter floated, 5.5rem Playfair, fills with the signature gradient (`background-clip: text`).
- **Pull quote**: Centered block, ~px-10 py-10, border-y, oversized `"` glyphs absolutely positioned at top-left and bottom-right in Vice Pink, italic Playfair 2xl–4xl text inside.
- **Magazine kicker / eyebrow**: `text-[11px] uppercase tracking-[0.4em] text-[#05D9E8] font-semibold` preceded by a 40px Vice-Pink or Cyan rule.

---

## 4. Spacing & Layout

- **Page max-width**: `max-w-[1400px] mx-auto`
- **Article reading column**: `max-w-3xl mx-auto` (~768px). Inline images break out with the `.full-bleed` class (see below).
- **Section vertical rhythm**: `py-20` to `py-32`. Hero sections are `min-h-[100vh]`.
- **Gutter**: `px-6 md:px-12` for most sections, `px-4 md:px-8` for the navbar.
- **Grid system**: 12-col on desktop (`grid-cols-12 gap-10`), 2-col on tablet, 1-col on mobile.

### Full-Bleed Image Escape
GameSpot-style edge-to-edge images break out of any constrained container with this CSS utility:

```css
.full-bleed {
  width: 100vw;
  max-width: 100vw;
  margin-left: calc(50% - 50vw);
  margin-right: calc(50% - 50vw);
}
```
Used inside the narrow article body so inline images can span the entire viewport while the surrounding text stays in the comfortable reading column.

---

## 5. Global Layout — What Sits on Every Page

Defined in `/app/frontend/src/App.js`:

```
<App>
  <BrowserRouter>
    <ScrollToTop />          // resets scroll on every route change
    <Navbar />               // fixed, top, two-tier
    <main>
      <Routes>…</Routes>     // current page
    </main>
    <FloatingShareButton />  // bottom-right share FAB (desktop only)
    <Footer />
  </BrowserRouter>
</App>
```

### Navbar (`/app/frontend/src/components/Navbar.jsx`)
Two-tier:
1. **Masthead micro-strip** (hidden on mobile): `Vol. 01 · Issue 06 · Feb 2026` left, live `<n> Days Until Leonida` pulse pill center, `Editorial · Atlas · Garage · Frequencies` right.
2. **Main row**: Logo on left, 7 nav links centered/right, hamburger on mobile.

Transparent over hero, then transitions to `bg-[#050505]/85 backdrop-blur-xl border-b border-white/10` on scroll past 30px.

### Footer (`/app/frontend/src/components/Footer.jsx`)
5-column grid: brand block + 4 link columns (Explore, Media, Release info). Disclaimer line at the bottom.

### Floating Share FAB (`/app/frontend/src/components/ShareWidget.jsx`)
- Visible on `md+` screens.
- Bottom-right, 48×48 circular button with the signature gradient.
- Clicking opens a 288px popover with X, Facebook, Reddit, Copy Link.
- On mobile, falls back to the share section on Home + the inline share row inside articles.

---

## 6. Page Inventory

| Route | Component | Purpose |
|------|------|------|
| `/` | `Home.jsx` | Cinematic landing — hero carousel, rails, data grid, share CTA |
| `/news` | `News.jsx` | Lead story + grid of 6 articles |
| `/news/:slug` | `Article.jsx` | Single long-form editorial piece |
| `/characters` | `Characters.jsx` | Protagonists feature + supporting cast grid |
| `/characters/:slug` | `CharacterDetail.jsx` | IMDb-density profile |
| `/locations` | `Locations.jsx` | Vice City districts + State of Leonida counties |
| `/locations/:slug` | `LocationDetail.jsx` | Single location profile |
| `/vehicles` | `Vehicles.jsx` | Filterable vehicle DB with animated stat bars |
| `/trailers` | `Trailers.jsx` | YouTube modal gallery |
| `/soundtrack` | `Soundtrack.jsx` | Confirmed tracks + radio dial |

---

## 7. Home Page Anatomy (top-to-bottom)

`/app/frontend/src/pages/Home.jsx`

1. **HERO BILLBOARD** (`min-h-[100vh]`, `scanline vignette`):
   - `<HeroCarousel>` — 5 rotating cinematic images, 6.5s interval, 2.2s crossfade, slow Ken-Burns zoom (`.animate-kenburns`).
   - Side overlay (left-to-right black-to-transparent) so headline reads on any image.
   - Vertical edge label rotated 180° using `writing-mode: vertical-rl` — magazine flourish.
   - Eyebrow → H1 (Bebas Neue with gradient accent word) → Italic dek (Playfair) → `<Countdown>` block → CTA pair (`Watch Trailer` filled, `Explore the Archive` outlined).
   - Slide indicator bottom-right: "Now Showing" label + slide pin dots + `02 / 05` counter.
2. **MARQUEE STRIP #1** — `<MarqueeStrip>` — pink accent diamonds, location/key-fact words scrolling.
3. **BY THE NUMBERS** — `<ByTheNumbers>` bento grid (4-col × 2-row, mixed cell sizes). Six cells: 2.5×, 12 districts, 02 protagonists, 30 FPS, RTGI, 11.19.26.
4. **COVER STORY** — Two-column featured editorial: 7/12 image with "COVER STORY" pink stamp, 5/12 text column with title + dek + CTA (hover line-draw on the link).
5. **NEWS RAIL** — `<HorizontalRail>` of `<ArticleCard>`s (issue numbers, hover scale, line-draw underline).
6. **CHARACTERS RAIL** — `<HorizontalRail>` of `<CharacterCard>`s (poster aspect 2/3, grayscale→color on hover).
7. **MARQUEE STRIP #2** — cyan diamonds, character-name litany.
8. **LOCATIONS RAIL** — `<HorizontalRail>` of `<LocationCard>`s.
9. **VEHICLES GRID** — 2×4 sample grid linking to `/vehicles`.
10. **SHARE WIDGET** — `<ShareWidget variant="section">` — viral CTA panel.
11. **RELEASE MARQUEE** — Full-bleed sunset image + gradient overlay + huge "November 19, 2026" headline + secondary Countdown block.

---

## 8. Article Page Anatomy (THE most important page)

`/app/frontend/src/pages/Article.jsx`

GameSpot-style. Structured in 5 sections.

### 8.1 Reading Progress Bar
- `<ReadingProgress>` — 3px fixed bar at the top of the viewport.
- Fills from 0 → 100% as the user scrolls.
- Uses the signature gradient (pink → orange → cyan).

### 8.2 Article Hero (`h-[92vh] min-h-[640px]`)
- `object-cover` full-bleed image with `object-position: center 30%` so faces and skylines aren't cropped at the chin.
- Two overlays: a vertical bottom-to-top dark gradient + a horizontal left-to-right gradient so the bottom-left text panel always has contrast.
- Subtle `.scanline .vignette .grain` accents.
- Inside the hero content panel (left-aligned, max-w-5xl):
  1. Back-to-Newsroom link (`ArrowLeft`).
  2. Pink category stamp + issue number.
  3. **Article title** in Playfair, `text-4xl md:text-7xl leading-[1.02]`.
  4. Italic dek under the title, `text-xl md:text-2xl Playfair`.
  5. Byline strip — circular gradient avatar (initials), author name, date, read time with clock icon. Separated by hairline.

### 8.3 Article Body (`max-w-3xl mx-auto`)
Renders an ordered list of "blocks" defined in `/app/frontend/src/data/articles.js`. Each article's `body` field is an array; each block has a `type`:

| Block type | Renders as |
|------|------|
| `lead` | Paragraph with a `.drop-cap` first-letter (Playfair, gradient-clipped). Always the first paragraph. |
| `p` | Standard Outfit body paragraph, `text-lg md:text-xl leading-[1.75] text-zinc-300`. |
| `h2` | Bebas Neue uppercase section heading with a Vice-Pink left border accent. |
| `pull` | Pull-quote — border-y panel, oversized smart quotes in Vice Pink at corners, italic Playfair text. |
| `image` | **FULL-BLEED** image (`.full-bleed`) — escapes the article column, fills the viewport width, 60–80vh tall, with a subtle vignette on top + caption beneath in narrow column. Uses `object-position: center 40%` to avoid awkward crops. |

### 8.4 Tags + Inline Share
Below the body but inside the reading column. Two rows:
1. "Filed Under" + tag pills (rounded-full, ghost border, hover Vice-Pink).
2. `<ShareWidget variant="inline">` — circular X / Facebook / Reddit icon buttons + "Copy link" pill.

### 8.5 Prev / Next Navigation
Two cards side-by-side. Each: tiny 112×80 image thumb + "Previous"/"Next" eyebrow + Playfair title (line-clamp-2). Wraps to one column on mobile.

### 8.6 Continue Reading
3-column grid of related articles (always shows up to 3, excluding the current one).

---

## 9. Component Library

All components live in `/app/frontend/src/components/`.

### 9.1 `<HeroCarousel>`
- Auto-advances every 6.5s with crossfade.
- Each slide has `{ image, label, accent, cue }` — the active slide's metadata is shown bottom-right.
- Slides export from the same file (`heroSlides`) for reuse.

### 9.2 `<Countdown compact={false}>`
- Live ticker calculating diff to `gameInfo.releaseDate` (2026-11-19).
- Two presentation modes:
  - **Default** — 4 large numeric cards (`Days · Hours · Mins · Secs`).
  - **Compact** — single-line with a pulse dot.

### 9.3 `<HorizontalRail title subtitle testid>`
- Wraps children in a horizontally-scrollable, snap-x container.
- Title row exposes left/right scroll buttons (only on `md+`) that shift the scroller by 85% of its width.

### 9.4 Card variants
| Component | Aspect | Use |
|------|------|------|
| `<ArticleCard>` | 16/10 default, 3/4 tall | News rail, related lists |
| `<CharacterCard>` | 2/3 (poster) | Cast rail, supporting grid |
| `<LocationCard>` | 16/10 | Locations rail, atlas grid |

All cards share the same hover formula: `scale-[1.03] z-10 shadow-pink-500/20` + gradient overlay + content-translate-up reveal.

### 9.5 `<MarqueeStrip items accent testid>`
- Duplicates the items array twice, then loops with a `-50%` translate animation (`38s linear infinite`).
- Pause on hover.
- Each item separated by a rotated 8×8 diamond using the accent color.

### 9.6 `<ByTheNumbers>`
- 4-col × 2-row bento grid (collapses to 2-col on mobile).
- Cell sizes (`lg`, `md`, `sm`) drive `col-span` / `row-span`.
- Each cell: enormous Bebas Neue number colored with the cell's accent, a 2-line uppercase label below it, a softer note at the bottom.
- Radial blurred glow blob in the top-right of each cell that brightens on hover.

### 9.7 `<ShareWidget variant>`
- `section` — full marketing block for the home page (text column + share panel).
- `inline` — compact row used at the bottom of articles.
- Plus `<FloatingShareButton>` — bottom-right FAB.
- Channels: X (Twitter), Facebook, Reddit, Copy link. Native `navigator.share()` is invoked on mobile when available.

### 9.8 `<ReadingProgress>`
- Tracks `scrollTop / (scrollHeight - clientHeight)` and renders a gradient bar at the top of the page.
- Only mounted inside `<Article>`.

---

## 10. Data Layer

All seed content lives in `/app/frontend/src/data/` — no API calls, no CMS. Each file exports plain JS arrays + helper `getX(slug)` functions.

| File | Exports |
|------|------|
| `articles.js` | `articles[]`, `getArticle(slug)` |
| `characters.js` | `characters[]`, `getCharacter(slug)` |
| `locations.js` | `locations[]`, `getLocation(slug)` |
| `vehicles.js` | `vehicles[]`, `vehicleCategories[]` |
| `trailers.js` | `trailers[]`, `getTrailer(slug)` |
| `soundtrack.js` | `confirmedSongs[]`, `radioStations[]` |
| `gameInfo.js` | `gameInfo` (release date, platforms, factions, gameplay pillars) |

### How to add a new article (the most common task)
1. Open `/app/frontend/src/data/articles.js`.
2. Add a new object to the `articles` array with the following shape:

```js
{
  slug: "url-friendly-slug",                 // becomes /news/<slug>
  category: "Feature" | "Characters" | "Tech" | "Music" | "Gameplay" | "World",
  title: "The headline",
  dek: "Italic standfirst that sits under the title.",
  author: "Editorial Desk",
  date: "Month DD, YYYY",
  readTime: "8 min read",
  heroImage: "https://...",                  // full-bleed hero image URL
  tags: ["World", "Vice City"],
  body: [
    { type: "lead", text: "First paragraph — gets the drop cap." },
    { type: "p",    text: "Standard paragraph." },
    { type: "h2",   text: "Section heading" },
    { type: "p",    text: "More body…" },
    { type: "pull", text: "A standout line, ~10–18 words." },
    { type: "image", src: "https://...", caption: "Optional caption." },
    { type: "p",    text: "Continuing prose…" }
  ]
}
```
3. Save. The new article will appear automatically on `/news` (sorted by array order) and at `/news/<slug>`.

### How to add a new character
Open `/app/frontend/src/data/characters.js` and add an object with: `slug, name, role, tagline, voiceActor, status, affiliation, origin, image, coverImage, bio, quote, facts[], abilities[], relatedCharacters[]`.

### How to add a new location
Open `/app/frontend/src/data/locations.js`. Required fields: `slug, name, region, analog, tagline, image, coverImage, description, facts[], relatedLocations[]`.

---

## 11. Animations

All defined in `/app/frontend/src/index.css`. CSS-only — no JS animation library.

| Keyframe | Effect | Used in |
|------|------|------|
| `fadeUp` | Translate-y 24px + opacity 0→1, 0.9s cubic-bezier | Hero entrance staggered with `.delay-150/300/500/700` |
| `kenburns` | Scale 1 → 1.12 + translate -1.5% / -1.5%, 9s ease-out | Active hero carousel slide |
| `marquee` | translateX 0 → -50%, 38s linear infinite | Marquee strips |
| `pulseDot` | Opacity 1↔0.4 + scale 1↔0.85, 1.6s | Live "days until launch" dot |
| `App-logo-spin` | Legacy, unused | — |

Interactive transitions use `transition-all duration-300` on hover. (Specific properties preferred where possible — `transition-opacity`, `transition-transform`.)

---

## 12. Imagery Rules

1. **Always use `object-cover`** with `object-position` tuned per context:
   - Hero images: `center 30%` (skylines, faces look right).
   - Inline article images: `center 40%`.
   - Character poster cards: default `center`.
2. **Never letterbox.** If an image's native aspect ratio is awkward, change the container aspect instead of using `object-contain`.
3. **Full-bleed in articles** — always use the `.full-bleed` class for inline images. The article body is narrow on purpose; images break out.
4. **Always wrap in a relative container** with `overflow-hidden` so `absolute inset-0` images don't escape rounded corners.
5. **Add a subtle vignette overlay** on hero images so text remains legible regardless of which image loads.

### Sourcing
- Bespoke generated images are stored on `static.prod-images.emergentagent.com`.
- Stock fallback sources: Unsplash (`https://images.unsplash.com/...?q=80&w=2400`) and Pexels.
- Add `?q=80&w=2400` to Unsplash URLs to force high-resolution.

---

## 13. Accessibility & Test IDs

- **Every interactive element has a `data-testid`** in kebab-case describing its function. Examples: `nav-news-link`, `article-back-link`, `share-section-x`, `floating-share-toggle`.
- All buttons that are icon-only have an `aria-label`.
- Color contrast is verified for the Vice Pink + White / Cyan + Black combinations used on key CTAs.
- The site is keyboard navigable. Modal close on click outside + Escape (where applicable).

---

## 14. Tech Stack Reference

| Layer | Choice |
|------|------|
| Framework | React 19 (Create React App + craco) |
| Routing | react-router-dom v7 |
| Styling | Tailwind CSS 3.4 + raw CSS for keyframes and `.full-bleed` |
| Icons | `lucide-react` |
| Fonts | Google Fonts (Bebas Neue, Playfair Display, Outfit) |
| Data | Static JS modules in `src/data/` |
| Backend | FastAPI + MongoDB (currently scaffold-only — no business logic) |
| Package manager | `yarn` (never `npm`) |

---

## 15. File Map (top-level)

```
/app/frontend/src/
├── App.js                       # Router + global chrome (Navbar, Footer, FloatingShare)
├── App.css                      # Minimal global resets
├── index.css                    # Tailwind layers + brand variables + keyframes + utilities
├── components/
│   ├── Navbar.jsx               # Masthead strip + nav
│   ├── Footer.jsx
│   ├── Countdown.jsx
│   ├── HorizontalRail.jsx       # Netflix-style snap rail
│   ├── ArticleCard.jsx          # Issue-numbered article tile
│   ├── CharacterCard.jsx        # Poster-aspect character tile
│   ├── LocationCard.jsx
│   ├── HeroCarousel.jsx         # Rotating hero w/ Ken-Burns
│   ├── MarqueeStrip.jsx         # Infinite typographic strip
│   ├── ByTheNumbers.jsx         # Bento data grid
│   ├── ShareWidget.jsx          # Section + inline + FAB
│   └── ReadingProgress.jsx      # Article scroll bar
├── pages/
│   ├── Home.jsx
│   ├── News.jsx                 # Article index
│   ├── Article.jsx              # ★ Editorial template (most important file)
│   ├── Characters.jsx
│   ├── CharacterDetail.jsx      # IMDb-style profile
│   ├── Locations.jsx
│   ├── LocationDetail.jsx
│   ├── Vehicles.jsx             # Filterable DB
│   ├── Trailers.jsx             # YouTube modal grid
│   └── Soundtrack.jsx
└── data/                        # All seed content
    ├── articles.js
    ├── characters.js
    ├── locations.js
    ├── vehicles.js
    ├── trailers.js
    ├── soundtrack.js
    └── gameInfo.js
```

---

## 16. The 12 Rules of Building Inside Leonida Vice

1. **Dark by default.** Don't introduce a light surface unless it's a CTA fill.
2. **Three fonts, three jobs.** Bebas for shouting, Playfair for storytelling, Outfit for everything else. Never mix their roles.
3. **Vice Pink is the primary accent.** Cyan is the secondary. Orange is the bridge between them. Don't add a fourth.
4. **Every page has a hero.** Even index pages get a generous 32px-padded header with a giant Bebas display title and a Playfair italic dek.
5. **Editorial body lives in a `max-w-3xl` column.** Always. Even when imagery breaks out.
6. **Inline article images go full-bleed.** Use the `.full-bleed` utility — viewport-edge to viewport-edge.
7. **Cards hover with three signals**: scale 1.03, border whitens, accent line draws across the bottom.
8. **Use `data-testid` on every interactive element.** Kebab-case, descriptive, unique.
9. **No emoji icons.** Use `lucide-react` only.
10. **Don't auto-play audio. Trailers open in modal with autoplay query param.**
11. **Live data (countdown, days until) updates on a 1s/1m interval.** Keep it ticking, even when the user isn't looking.
12. **When in doubt, ask: would GameSpot publish this?** If the answer is no, refactor.

---

*End of design system. Hand this file to any collaborator and they should be able to build a new page that feels native to Leonida Vice within a single session.*
