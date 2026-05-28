# Leonida Vice — Product Requirements

## Original Problem Statement
> "hey I'm making a GTA 6 fansite called leonida vice ... read the pdfs attached and make me a Netflix / IMDb / gamespot clone website ... beautiful UI mixed with the styling elements from these websites ... spectacular ... most anticipated game of all time ... beautiful editorial style of gamespot articles ... beautiful card designs of Netflix and the data density of IMDb ... seed data everywhere ... every page should be a standalone page that is fully fleshed out ... correct information and images only ... huge epic background images with text styling underneath ... the article styling is arguably the most important part of my website"

## Architecture
- **Stack:** React 19 (CRA + craco), Tailwind, react-router-dom v7, FastAPI + MongoDB scaffolding (not currently used; site is static seed-data driven by user choice).
- **Theme:** Tropical Noir / Vice City Epic — dark-first, Bebas Neue + Playfair Display + Outfit, vice-pink / sunset-orange / cyan-edge palette.
- **Routing:** Home, News, News Article, Characters, Character Detail, Locations, Location Detail, Vehicles, Trailers, Soundtrack.
- **Data:** All seed data lives in `/app/frontend/src/data/` (articles, characters, locations, vehicles, trailers, soundtrack, gameInfo). All info verified against the supplied GTA 6 Knowledge Base PDF.

## User Personas
- **Hardcore fan** — wants editorial deep-dives and verified information.
- **Casual visitor** — wants spectacle and shareable visuals on landing.
- **Search-driven visitor** — lands on a character/location detail page and expects it to be fully fleshed out.

## Core Requirements (Static)
- Editorial article styling (GameSpot): full-bleed hero, drop-cap intro, pull quotes, inline images, related articles footer.
- Netflix-style horizontal rails on home (news, characters, locations).
- IMDb-style data density on character and location detail pages (quick-facts sidebar + body).
- Every page is a standalone, fully-fleshed-out page. No empty states.
- Countdown to November 19, 2026.
- YouTube trailers embedded.

## What's Been Implemented (Feb 2026 — Initial MVP)
- ✅ Home page with cinematic hero, live countdown, featured cover story, 4 horizontal rails (News, Cast, Locations, Garage strip), release marquee.
- ✅ News hub with lead story + grid of 6 long-form articles.
- ✅ Article template (GameSpot style) — full-bleed hero, drop cap, pull quotes, inline images, related articles.
- ✅ Characters hub (large protagonists + supporting grid).
- ✅ Character detail (IMDb data density — quick facts, abilities, biography, quote, connected characters).
- ✅ Locations atlas (Vice City districts + State of Leonida counties).
- ✅ Location detail page.
- ✅ Vehicles database with category filters and animated stat bars.
- ✅ Trailers media vault with in-page YouTube modal.
- ✅ Soundtrack page (confirmed tracks + radio dial).
- ✅ Persistent Navbar + Footer with mobile menu.
- ✅ ScrollToTop on route change.
- ✅ Custom Bebas Neue / Playfair Display / Outfit font stack.
- ✅ data-testid attributes on every interactive element.

## Prioritized Backlog
- **P1:** Newsletter signup (email capture to backend) + Mongo collection.
- **P1:** AI-powered "Ask Leonida" lore chatbot (Claude Sonnet via Emergent LLM key).
- **P2:** Admin CMS to add/edit articles via Mongo.
- **P2:** User accounts (favorites, comments).
- **P2:** Interactive Leonida map (SVG district outlines, click-to-explore).
- **P3:** Community forum / comments.
- **P3:** Live release-time-zone selector for the countdown.

## Next Tasks
1. (Optional) Newsletter signup integration.
2. (Optional) Interactive map page.
3. (Optional) AI lore assistant.

## Notes
- Backend is intentionally minimal (status_check endpoints only) because user chose option (a) Static seed-data driven.
- No third-party integrations implemented. YouTube embeds are free, key-less.
