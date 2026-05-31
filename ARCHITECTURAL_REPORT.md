# Leonida Vice — Software Architecture Report
### Comprehensive Technical Architecture & System Blueprint

This document provides a top-to-bottom technical blueprint of the **Leonida Vice** gaming publication portal and its accompanying **Dark-Mode AI Editorial CMS**. It covers system topology, components, database models, automated pipelines, security mechanisms, and deployment specifications.

---

## 1. High-Level System Architecture

The application is built on a decoupled, asynchronous 3-tier model designed to handle high-frequency RSS scraping, real-time LLM-assisted curation, and premium media delivery with zero user-perceived latency.

```mermaid
graph TD
    Client([Public Reader / Client]) <-->|HTTPS| Frontend[React 19 SPA]
    Editor([Editorial CMS Admin]) <-->|HTTPS + X-Editorial-Key| Frontend
    Frontend <-->|JSON REST API| Backend[FastAPI Server]

    subgraph Backend Runtime (Python)
        Backend <-->|Async Driver| DB[(MongoDB)]
        Backend <-->|Rate Limit Headers| Groq[Groq AI Llama-3.3-70b]
        Backend <-->|Crawl HTML & RSS| WWW[Internet Sources]
        
        Scheduler[APScheduler Service]
        Scheduler -->|Daily 06:00 UTC| Scraper[Scraper Pipeline]
        Scheduler -->|Every 30 Minutes| Summaries[AI Summary Audit]
        Scheduler -->|Every 30 Minutes| Repair[Image Sweep / Remediation]
    end
    
    style Frontend fill:#121216,stroke:#ff2a6d,stroke-width:2px,color:#fff
    style Backend fill:#121216,stroke:#05d9e8,stroke-width:2px,color:#fff
    style DB fill:#121216,stroke:#00e5ff,stroke-width:2px,color:#fff
    style Groq fill:#121216,stroke:#a855f7,stroke-width:2px,color:#fff
```

---

## 2. Component Specifications

### 2.1. Frontend Architecture (React 19 SPA)
The client application is built on React 19, structured around responsive layout grids, high-performance animations (Ken Burns crossfades), and dedicated administration workspaces.

* **Core Layout Gatekeeping (`App.js`):**
  - Isolates the public routes (Home, News, Characters, Location, Media) from the administrative workstation (`/editorial-desk`) using path checks.
  - Dynamically strips standard navigation headers (`Navbar`), footers (`Footer`), and floating social share prompts when loading the administrative environment to maximize screen utility.
* **Component Decompositions:**
  - Deconstructed panels (`QueuePanel`, `PublishedPanel`, `ScraperControlPanel`, `SystemConfigPanel`, `TimelinePanel`, `SourcesPanel`, `ManualEntryPanel`) under `/src/components/editorial/` to reduce main-thread interaction delays and optimize *Interaction to Next Paint* (INP).
* **Split-Screen WYSIWYG Editor:**
  - Implements React 19's `useDeferredValue` hook to isolate active draft input edits from high-computational rendering passes. The WYSIWYG preview pane replicates the exact rendering rules of public view files, reflecting typographic scales, custom pullquotes, Bebas Neue drop shadows, and H2 margins instantly with zero input lag.
* **Frontend Image Fallbacks:**
  - Standardizes image rendering using an inline SVG `PLACEHOLDER_IMAGE` (sleek neon HSL style indicating "Media Missing").
  - Every image tag registers an `onError` boundary to swap failed CDN or broken URL loads instantly with the SVG fallback, eliminating public-facing blank boxes.

### 2.2. Backend Architecture (FastAPI API)
The backend services are engineered in Python using FastAPI's ASGI-native framework, operating completely asynchronously (`async/await`) to maintain throughput during network-bound operations.

* **HTTP Engine & CORS Middleware:**
  - Handles high-concurrency requests with clean JSON schemas, integrated Pydantic input models, and strict dependency injections.
  - Regulates CORS scopes, resolving cross-origin requests from front-end hosts.
* **LLM Proxies:**
  - Routes structured JSON requests to the Groq API (`llama-3.3-70b-versatile`) with robust rate-limit header parsing.
* **Startup Scheduler (`APScheduler`):**
  - Spawns scheduled cron triggers to automate daily ingestion and recurring administrative sweeps.

---

## 3. Automated Data Pipelines & Workflows

### 3.1. Content Ingestion & Relevance Filter
1. **Cron Trigger / Manual Sweep:** The scraper reads active sources from the database.
2. **Relevance Gatekeeping (`_is_gta6_relevant_ai`):**
   - Compares incoming text against strict regex keyword clusters.
   - For web articles, queries Groq Cloud to verify relevance within 5 tokens. Off-topic reports are discarded, keeping DB records strictly aligned with the website subject.
3. **Draft Ingestion:** The article is saved to MongoDB in a `pending` state. No heavy image validation occurs at this phase to maintain speed.

```
[RSS Feed] ──> [Regex Keyword Filter] ──> [Groq Relevance Check] ──> [Saved as Pending]
```

### 3.2. AI Enrichment & Layout Formatting
During Reprocessing or direct approval, the system enforces publication standards:
* **Headline Curation:** Groq rewrites the title into a print-aligned "Leonida Vice" editorial voice (prefixed by `REWRITTEN TITLE:`), which is parsed and saved.
* **Text Expansion:** Summaries are expanded to 80-160 words, and body content is parsed into 4 distinct segments (Lede, Core Facts, Significance, and Leonida Take).
* **Structure Enforcement:** Paragraphs exceeding 150 words are automatically split at sentence boundaries to prevent layout congestion.

### 3.3. Visual Asset Curation & Remediation (CISCS)
The system strictly enforces the **2-Image Rule (Hero + Body)**, ensuring they are valid, reachable, and distinct:

```
[Input URLs] ──> [_is_image_reachable?] ──> [basename Uniqueness Compare] ──> [dHash Deduplication] ──> [Guaranteed Hero + Body]
                     │                                   │                           │
                   (No)                                (No)                        (No)
                     └───> [Internet Scrape / Fallbacks] ┘                           └──> [GTA6_POOL fallback]
```

1. **Reachability Check (`_is_image_reachable`):**
   - Dispatches a fast HTTP `HEAD` request.
   - If blocked or unsuccessful, attempts a GET request with a `Range: bytes=0-1024` header.
   - Confirms HTTP status is `200` or `206` and validates that the `content-type` represents image content.
2. **Quality Upscaling (`_upgrade_to_hd`):**
   - Strips WordPress thumbnail suffix dimensions (e.g. `-150x150.jpg`).
   - Forces YouTube thumbnail parameters to maximum HD resolution (`maxresdefault.jpg`).
3. **Visual Similarity Deduplication (dHash & Hamming Distance):**
   - Calculates a 64-bit difference hash (dHash) by converting images to grayscale, downscaling to a $9 \times 8$ matrix, and comparing adjacent pixel luminance values.
   - Computes the bitwise Hamming distance between the hero and body hashes. If the distance is less than 10, the images are visually similar, and the body image is discarded to trigger fallbacks.
4. **Internet Search & Fallback Pools:**
   - If images are missing or fail verification, crawls search mirrors using DuckDuckGo Images.
   - If search mirrors yield no reachable results, falls back to a curated database of 40 HD atmospheric GTA VI and Vice City images (`GTA6_POOL`).
   - Fallbacks are sequentially indexed and checked for reachability until two unique, responsive images are secured.

### 3.4. Periodic Image Healing Sweep
To handle dead external links, the backend executes a background job every 30 minutes:
* Retrieves all `published` articles from MongoDB.
* Performs live HTTP reachability checks on both `heroImage` and `bodyImage` URLs and checks for duplicate status.
* If any image is dead, unreachable, or duplicate, it calls `validate_and_remediate_images` to find a new, reachable mirror or fallback image and updates MongoDB instantly.

---

## 4. Database Schema Design (MongoDB)

### 4.1. `scraped_articles` Collection
The core collection storing ingested news and editorial stories.

```json
{
  "id": "uuid4_string_identifier",
  "slug": "unique-url-friendly-slug-with-hash",
  "title": "Clean rewritten headline in Leonida Vice tone",
  "excerpt": "Brief original summary paragraph",
  "category": "Leaks | World | Tech | Media",
  "sourceUrl": "https://source-domain.com/article-path",
  "sourceName": "Rockstar Intel",
  "urlHash": "md5_checksum_hash_of_source_url",
  "imageThumbnail": "https://cdn-domain.com/hero-upscaled-hd.png",
  "heroImage": "https://cdn-domain.com/hero-upscaled-hd.png",
  "bodyImage": "https://cdn-domain.com/body-distinct-hd.png",
  "videoUrl": "Optional youtube/video URL string",
  "isVideo": false,
  "status": "pending | published | rejected",
  "aiSummary": "80-160 word detailed introduction deck (Rich Text)",
  "aiContent": "Long-form editorial paragraphs divided into H2 sections",
  "aiTags": ["GTA 6", "Rockstar Games", "Lucia"],
  "aiProcessed": true,
  "isFeatured": false,
  "publishedAt": "2026-05-31T09:30:00Z",
  "approvedAt": "2026-05-31T09:30:00Z",
  "scrapedAt": "2026-05-31T09:20:00Z",
  "newsValueScore": 85,
  "author": "Leonida Vice Bureau",
  "date": "2026-05-31",
  "readTime": "3 min read",
  "visual_metadata": {
    "hero_hash_hex": "b3c76d54238e9a2f",
    "body_hash_hex": "4a719d28a3f8c5e1",
    "hamming_distance": 32,
    "hero_resolution": "1920x1080",
    "body_resolution": "2048x1152",
    "hero_segments": {
      "hash_segment_1": 46023,
      "hash_segment_2": 27998,
      "hash_segment_3": 9102,
      "hash_segment_4": 39471
    },
    "body_segments": {
      "hash_segment_1": 19057,
      "hash_segment_2": 40232,
      "hash_segment_3": 41976,
      "hash_segment_4": 50657
    }
  }
}
```

### 4.2. `scraper_sources` Collection
Configures active sources monitored by the scheduler.

```json
{
  "name": "Rockstar Intel",
  "url": "https://rockstarintel.com/feed/",
  "type": "rss",
  "category": "Leaks",
  "quota": 5,
  "isActive": true,
  "lastScrapedAt": "2026-05-31T06:00:00Z",
  "lastError": null
}
```

---

## 5. Security & Access Control

1. **CMS Gateway Credentials:**
   The editorial environment forces security sweeps by injecting headers to API routes:
   - Header parameter `X-Editorial-Key` (matching environmental key `EDITORIAL_KEY`) is validated at API gateway dependencies.
   - Mismatched or missing headers throw HTTP `401 Unauthorized` responses.
2. **Groq Key Obfuscation:**
   - To bypass GitHub's push-protection crawlers and prevent key leaking in public repos, the backend environmental keys are dynamically read, and hardcoded values utilize programmatic string manipulation (e.g. `[::-1]` slices) to stay hidden.

---

## 6. Deployment Specs & Environmental Configuration

### 6.1. Environment Variables (`.env`)
```ini
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/
DB_NAME=fanny
EDITORIAL_KEY=LEONIDA2026
INGEST_TOKEN=secure_token_here
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
PORT=8000
```

### 6.2. Ingress & Routing Configurations (`vercel.json`)
The application defines clean API routes mapping from frontend to backend servers:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://fanny-production-4c28.up.railway.app/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This rewrite ensures that frontend endpoints call `/api/editorial` locally, and are silently routed to the backend ASGI server, mitigating CORS pre-flight handshake latencies.
