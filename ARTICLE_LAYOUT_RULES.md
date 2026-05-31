# ARTICLE LAYOUT RULES — LEONIDA VICE
## PERMANENT — DO NOT BREAK THESE RULES

---

## Image Structure (2 images per article — STRICT)

All images MUST be HD quality and scraped directly from the same source website as the article. No fallback pools. No generic stock images. No exceptions.

| Slot | Name | Source | Rule |
|------|------|--------|------|
| 1 | **Hero / Header** | Scraped from source page (`og:image` or first large image) | Full-bleed behind the title. Stored as `imageThumbnail` / `heroImage`. |
| 2 | **Body Image** | Scraped from same source page — unique, different from hero | Must be a second distinct image from the article source. Stored as `bodyImage`. NEVER a copy of the hero. |

**If the scraper cannot find both images from the source page, the article is SKIPPED and not ingested. No exceptions.**

## Body Image Selection Logic
1. Fetch the full source article HTML page
2. Extract `og:image` as the hero candidate
3. Extract all `<img src>` and `srcset` candidates from the page
4. Filter out icons, logos, avatars, ads, sprites, and tracking pixels
5. Hero = `og:image` or first valid candidate
6. Body = first valid candidate that is NOT the hero
7. If no unique second image exists — article is discarded, not published

## Tag → Theme → Image Mappings
*(Deprecated — body images are now scraped directly from the source page, not selected from a pool)*

---

## Layout Structure (in order, top to bottom)

```
[HERO IMAGE — full bleed, 92vh, title + byline overlaid]
[DROP-CAP LEAD PARAGRAPH — large italic, 21–24px]
[H2 — pink left border, uppercase, "Core Intel Briefing"]
[PARAGRAPH 1 — body text]
[PULLQUOTE — italic, large, pink " " marks]
[H2 — "Why It Matters"]
[PARAGRAPH 2 — body text]
[BODY IMAGE — full-bleed, ARTICLE-RELEVANT, 60–80vh]
[H2 — "Leonida Take & Context"]
[PARAGRAPH 3 — body text]
[TAGS + SHARE WIDGET]
[PREV / NEXT navigation]
[CONTINUE READING — 3 related articles]
```

---

## Rules for Dynamic Articles (from scraper/API)
- Source text: `aiContent` field split by `\n` into paragraphs
- AI produces 4 paragraphs: `[0]`=Lede, `[1]`=Core Facts, `[2]`=Significance, `[3]`=Leonida Take
- Layout mapping in `normalizeArticle()`:
  - Drop-cap lead → `aiSummary` (editorial deck)
  - Core Intel Briefing → `[0]` (Lede) + `[1]` (Core Facts)
  - Why It Matters → `[2]` (Significance)
  - Leonida Take & Context → `[3]` (Leonida Take)
- If `aiContent` is missing, use `excerpt` + filler paragraph
- `body: []` from the API is ALWAYS overridden — `normalizeArticle()` in `Article.jsx` builds the layout from scratch
- Author always defaults to `"Leonida Vice"` if null
- Date: use `publishedAt` → `approvedAt` → `scrapedAt` (in that order)
- Read time: default `"2 min read"` if null

---

## What Is FORBIDDEN
- ❌ Fallback image pools or generic stock images (Unsplash, Pexels, etc.) as body images
- ❌ Duplicating the hero image as the body image
- ❌ Publishing articles without a scraped hero AND scraped body image from the source
- ❌ Empty `body` arrays rendering as blank articles
- ❌ `/newswire` routes — all articles live under `/news/:slug`
- ❌ More than 1 body image per article
- ❌ Non-HD or low-resolution/fuzzy images (all assets must be crisp HD from source)

