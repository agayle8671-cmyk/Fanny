# ARTICLE LAYOUT RULES — LEONIDA VICE
## PERMANENT — DO NOT BREAK THESE RULES

---

## Image Structure (2 images per article — STRICT)

| Slot | Name | Source | Rule |
|------|------|--------|------|
| 1 | **Hero / Header** | `article.heroImage` or `article.imageThumbnail` | Full-bleed behind the title. Never duplicated below. |
| 2 | **Body Image** | Contextual — derived from article topic | Must be RELATED to the article content. Chosen from `aiTags` keywords or category. NEVER a random generic image. NEVER a copy of the hero. |

## Body Image Selection Logic (in priority order)
1. Match against article `aiTags` — pick an image thematically tied to those tags
2. Fall back to article `category` if no tag match
3. Use a hash of the article `id` as a tie-breaker within matched pool
4. The secondary image index must differ by at least 4 slots from the primary

## Tag → Theme → Image Mappings
- Tags containing `union`, `lawsuit`, `legal`, `rights` → corporate/workers image
- Tags containing `rockstar`, `GTA6`, `GTA`, `game`, `trailer`, `RAGE`, `engine`, `fps`, `performance`, `AI`, `tech` → Vice City / Florida cinematic
- Tags containing `leak`, `screenshot`, `reveal` → mysterious/dark city
- Tags containing `video`, `youtube`, `media`, `entertainment` → cinema/screen
- Tags containing `market`, `stock`, `business`, `economy`, `sales` → financial district
- Tags containing `crime`, `police`, `heist` → dark urban / night city
- Tags containing `sports` → action / stadium
- Tags containing `music`, `soundtrack` → concert / neon

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
- If `aiContent` is missing, use `excerpt` + filler paragraph
- `body: []` from the API is ALWAYS overridden — `normalizeArticle()` in `Article.jsx` builds the layout from scratch
- Author always defaults to `"Leonida Vice"` if null
- Date: use `publishedAt` → `approvedAt` → `scrapedAt` (in that order)
- Read time: default `"2 min read"` if null

---

## What Is FORBIDDEN
- ❌ Random/generic Unsplash images with no connection to the article topic
- ❌ Duplicating the hero image as the body image
- ❌ Empty `body` arrays rendering as blank articles
- ❌ `/newswire` routes — all articles live under `/news/:slug`
- ❌ More than 1 body image per article
