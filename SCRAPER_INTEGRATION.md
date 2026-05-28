# Leonida Vice — Scraper Integration Guide

Hand this file to whoever owns the scraper (the `api-server` artifact from your previous codebase).

## 1. Endpoint

```
POST {REACT_APP_BACKEND_URL}/api/articles/ingest
Authorization: Bearer <INGEST_TOKEN>
Content-Type: application/json
```

Production base URL is whatever is in `/app/frontend/.env` → `REACT_APP_BACKEND_URL`.

## 2. Auth

Pre-shared bearer token. Lives in `/app/backend/.env` as `INGEST_TOKEN=...`. Rotate it by editing that file and running `sudo supervisorctl restart backend`.

Requests without the header → `401`. Wrong token → `403`.

## 3. Request body

```json
{
  "articles": [
    {
      "slug": "ign-rockstar-q4-2026-confirm",
      "title": "Rockstar reaffirms November 19, 2026 launch window",
      "excerpt": "Short two-line dek...",
      "aiSummary": "One-paragraph LLM summary for the card.",
      "category": "World",
      "sourceName": "IGN",
      "sourceUrl": "https://ign.com/...",
      "url": "https://ign.com/...",
      "imageThumbnail": "https://...",
      "videoThumbnail": null,
      "isVideo": false,
      "newsValueScore": 92,
      "commentsCount": 1247,
      "publishedAt": "2026-02-12T15:30:00Z",
      "scrapedAt": "2026-02-12T15:35:11Z"
    }
  ]
}
```

- `slug` is the upsert key. Re-POSTing the same slug updates the existing record.
- `newsValueScore ≥ 70` triggers the red "HOT" badge on the UI.
- `publishedAt` drives sort order on `/intel` and the home Newswire rail.
- Allowed categories that match the front-end filter pills: `Leaks`, `Tech`, `Story`, `Trailers`, `World`, `Markets`. Anything else still ingests but won't match the filter.

## 4. Read endpoints (public, no auth)

| Endpoint | Purpose |
|------|------|
| `GET /api/articles?category=&limit=&offset=` | Paginated feed, sorted by `publishedAt` desc |
| `GET /api/articles/trending?limit=10` | Top items by `newsValueScore` from the last 48h (falls back to all-time if last 48h is empty) |
| `GET /api/articles/:slug` | Single article |

## 5. Quick test

```bash
TOKEN=$(grep INGEST_TOKEN /app/backend/.env | cut -d'=' -f2)
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d'=' -f2)

curl -X POST "$API/api/articles/ingest" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"articles":[{"slug":"test","title":"Hello from the scraper","newsValueScore":85,"publishedAt":"2026-02-12T12:00:00Z","sourceName":"Test"}]}'
```

Then refresh the homepage — the card will appear in the Newswire rail under "The Newswire".
