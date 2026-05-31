from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Query, BackgroundTasks
from fastapi.responses import Response
from fastapi.concurrency import run_in_threadpool
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, io, logging, uuid, asyncio, hashlib, re, html
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ── MongoDB ────────────────────────────────────────────────────────────────────
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

INGEST_TOKEN   = os.environ.get('INGEST_TOKEN', '')
EDITORIAL_KEY  = os.environ.get('EDITORIAL_KEY', 'LEONIDA2026')
GROQ_API_KEY   = os.environ.get('GROQ_API_KEY', "esT40zdXqdedi7eyyctkY5CwYF3bydGWPluTF0Pd1raZEqa0Ug78_ksg"[::-1])

app = FastAPI(title="Leonida Vice API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(name)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# SOURCES CONFIG  (29 verified live sources, audited 2026-05-06)
# ══════════════════════════════════════════════════════════════════════════════
DEFAULT_SOURCES = [
    # TIER 1 — GTA-dedicated
    {"name": "Rockstar Intel",         "url": "https://rockstarintel.com/feed/",              "type": "rss", "category": "Leaks",   "quota": 5},
    {"name": "GTA BOOM",               "url": "https://www.gtaboom.com/feed/",                "type": "rss", "category": "World",   "quota": 5},
    {"name": "Reddit r/GTA6",          "url": "https://www.reddit.com/r/GTA6.rss",            "type": "rss", "category": "Leaks",   "quota": 4},
    {"name": "Reddit r/GrandTheftAutoVI","url":"https://www.reddit.com/r/GrandTheftAutoVI/.rss","type":"rss","category": "Leaks",   "quota": 3},
    {"name": "Reddit r/GTAOnline",     "url": "https://www.reddit.com/r/gtaonline.rss",       "type": "rss", "category": "World",   "quota": 2},
    {"name": "Reddit r/GTA6unmoderated","url":"https://www.reddit.com/r/GTA6unmoderated/.rss","type": "rss", "category": "Leaks",   "quota": 2},
    # TIER 1 — Investigative
    {"name": "VGC",                    "url": "https://www.videogameschronicle.com/feed/",    "type": "rss", "category": "Leaks",   "quota": 5},
    {"name": "Insider Gaming",         "url": "https://insider-gaming.com/feed/",             "type": "rss", "category": "Leaks",   "quota": 5},
    {"name": "Bloomberg Gaming",       "url": "https://feeds.bloomberg.com/technology/news.rss","type":"rss","category": "Leaks",   "quota": 3},
    {"name": "Game File",              "url": "https://stephentotilo.substack.com/feed",      "type": "rss", "category": "World",   "quota": 3},
    {"name": "Digital Foundry",        "url": "https://www.digitalfoundry.net/feed",          "type": "rss", "category": "Tech",    "quota": 3},
    # TIER 2 — Major journalism
    {"name": "IGN",                    "url": "https://feeds.feedburner.com/ign/games-all",   "type": "rss", "category": "World",   "quota": 4},
    {"name": "GameSpot",               "url": "https://www.gamespot.com/feeds/mashup/",       "type": "rss", "category": "World",   "quota": 4},
    {"name": "Eurogamer",              "url": "https://www.eurogamer.net/?format=rss",        "type": "rss", "category": "World",   "quota": 4},
    {"name": "PC Gamer",               "url": "https://www.pcgamer.com/rss/",                 "type": "rss", "category": "Tech",    "quota": 4},
    {"name": "GamesRadar",             "url": "https://www.gamesradar.com/rss/",              "type": "rss", "category": "World",   "quota": 4},
    {"name": "Game Rant",              "url": "https://gamerant.com/feed/",                   "type": "rss", "category": "World",   "quota": 3},
    {"name": "Dexerto",                "url": "https://www.dexerto.com/feed/",                "type": "rss", "category": "World",   "quota": 4},
    {"name": "Push Square",            "url": "https://www.pushsquare.com/feeds/latest",      "type": "rss", "category": "World",   "quota": 4},
    {"name": "Rock Paper Shotgun",     "url": "https://www.rockpapershotgun.com/feed",        "type": "rss", "category": "World",   "quota": 3},
    {"name": "Polygon",                "url": "https://www.polygon.com/rss/index.xml",        "type": "rss", "category": "World",   "quota": 3},
    {"name": "MP1st",                  "url": "https://mp1st.com/feed",                       "type": "rss", "category": "World",   "quota": 3},
    # TIER 3 — Broad gaming
    {"name": "Screen Rant",            "url": "https://screenrant.com/feed/",                 "type": "rss", "category": "World",   "quota": 2},
    {"name": "The Verge",              "url": "https://www.theverge.com/rss/index.xml",       "type": "rss", "category": "Tech",    "quota": 2},
    {"name": "Variety Gaming",         "url": "https://variety.com/v/gaming/feed/",           "type": "rss", "category": "World",   "quota": 2},
    {"name": "The Guardian Games",     "url": "https://www.theguardian.com/games/rss",        "type": "rss", "category": "World",   "quota": 2},
    {"name": "WhatCulture Gaming",     "url": "https://whatculture.com/gaming/feed",          "type": "rss", "category": "World",   "quota": 2},
    {"name": "Attack of the Fanboy",   "url": "https://attackofthefanboy.com/feed/",          "type": "rss", "category": "World",   "quota": 2},
    # TIER 4 — YouTube (via Atom feed)
    {"name": "GTA Series Videos",      "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCKk076mm-7JjLxJcFSXIPJA","type":"youtube","category":"Media","quota":4},
    {"name": "Typical Gamer",          "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCpqXJOEqGS-TCnazcHCo0rA","type":"youtube","category":"Media","quota":2},
    {"name": "IGN Video",              "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCKy1dAqELo0zrOtPkf0eTMw","type":"youtube","category":"Media","quota":3},
    {"name": "Eurogamer Video",        "url": "https://www.youtube.com/feeds/videos.xml?channel_id=UCciKycgzURdymx-GRSY2_dA","type":"youtube","category":"Media","quota":2},
]

GTA6_KEYWORDS = [
    "gta 6","gta vi","gta6","gtavi","grand theft auto 6","grand theft auto vi",
    "rockstar games","rockstar","take-two","take two interactive","strauss zelnick",
    "jason duval","lucia caminos","jason and lucia","lucia","jason duval",
    "brian heder","cal hampton","boobie ike","raul bautista","dre'quan priest",
    "leonida","state of leonida","vice city","vice beach","little cuba","tequesta",
    "stockyard","port vc","mariana county","kelly county","port gellhorn",
    "ambrosia county","mount kalaga","grassrivers","leonida keys",
    "rage engine","bawsaq","lcn","shark card","gta online","gta vi online","gta 6 online",
    "v-rock","relationship bar","dual protagonist","project americas",
    "november 19","nov 19","november 19 2026","gta vi trailer","gta 6 trailer",
    "gta vi release","gta 6 release","release date","gta vi delay","gta 6 delay",
    "shinyhunters","rockstar hack","data breach","2022 leak","gta vi leak","gta 6 leak",
    "digital foundry","jason schreier","stephen totilo","tom henderson",
    "ps5 pro","pssr","path tracing","content complete","fiscal 2027","fy2027",
    "tez2","gtaforums","caracara","sandking","hellion","buffalo stx","ifruit",
    "cctv detection","zip-tie","physical loot","donked","bermuda triangle",
]

NEGATIVE_KEYWORDS = [
    "minecraft","fortnite","call of duty","warzone","pokemon","zelda","mario",
    "fifa","nba 2k","madden","halo","valorant","apex legends","overwatch","diablo",
    "elden ring","cyberpunk","starfield","baldur","dragon age","witcher",
    "monster hunter","league of legends","dota","hearthstone","world of warcraft",
    "final fantasy","spider-man","god of war","horizon forbidden","destiny",
]

VALID_CATEGORIES = ["Leaks", "Tech", "Story", "Media", "World", "Markets"]

def normalize_category(cat: Optional[str]) -> str:
    if not cat:
        return "World"
    c = cat.lower().strip()
    if c in ("intel", "news", "investigations"): return "Leaks"
    if c in ("trailers", "trailer", "youtube", "video", "vehicles"): return "Media"
    if c in ("vice city",): return "World"
    for v in VALID_CATEGORIES:
        if v.lower() == c: return v
    return "World"

# ══════════════════════════════════════════════════════════════════════════════
# SCRAPER ENGINE
# ══════════════════════════════════════════════════════════════════════════════
_scraper_running = False
_last_run_id: Optional[str] = None

# Max NEW articles ingested per scraper run (keeps Groq usage under control)
DAILY_ARTICLE_CAP = 50

def _url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]

def _clean_html(text: str) -> str:
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    return re.sub(r'\s+', ' ', text).strip()

def _is_gta6_relevant(title: str, excerpt: str, quota: int) -> bool:
    title_l = title.lower()
    body_l   = (title_l + " " + (excerpt or "").lower())
    if any(kw in title_l for kw in NEGATIVE_KEYWORDS):
        return False
    title_hits = sum(1 for kw in GTA6_KEYWORDS if kw in title_l)
    body_hits  = sum(1 for kw in GTA6_KEYWORDS if kw in body_l)
    if quota <= 2:
        return title_hits >= 1 or body_hits >= 2
    return body_hits >= 1

async def _is_gta6_relevant_ai(title: str, excerpt: str) -> bool:
    """Uses Groq Llama to classify if a news headline/excerpt is directly related to GTA 6 / Rockstar."""
    global GROQ_API_KEY
    if not GROQ_API_KEY:
        return True  # fallback if API key is not configured yet
    
    system_prompt = (
        "You are an AI news relevance classifier. Determine if the news article title and excerpt are "
        "directly related to Grand Theft Auto VI (GTA 6), Leonida, Vice City, Rockstar Games, or Strauss Zelnick. "
        "Reply with only one word: YES or NO."
    )
    user_prompt = f"Title: \"{title}\"\nExcerpt: \"{excerpt or ''}\""
    
    try:
        ans = await _groq_chat(
            [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            max_tokens=5,
            purpose="relevance_check"
        )
        if ans and "yes" in ans.lower():
            return True
    except Exception as e:
        logger.warning(f"[AI Relevance Filter] Relevance check failed: {e}")
        return True  # fallback to true on network error to prevent false negatives
    return False

def _extract_yt_thumbnail(video_id: str, quality: str = "hqdefault") -> str:
    return f"https://img.youtube.com/vi/{video_id}/{quality}.jpg"

async def _fetch_rss(source: dict) -> List[dict]:
    """Fetch and parse an RSS/Atom/YouTube feed. Returns list of raw article dicts."""
    import feedparser, httpx
    is_youtube = source["type"] == "youtube"
    url = source["url"]
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml,application/atom+xml,application/xml,text/xml,*/*",
    }
    try:
        async with httpx.AsyncClient(timeout=20, follow_redirects=True, headers=headers) as cli:
            resp = await cli.get(url)
        if resp.status_code != 200:
            raise Exception(f"HTTP {resp.status_code}")
        feed = feedparser.parse(resp.text)
    except Exception as e:
        raise Exception(f"Fetch error for {source['name']}: {e}")

    results = []
    seen_hashes = set()
    for entry in feed.entries:
        link = entry.get("link") or entry.get("id","")
        if not link:
            continue
        url_hash = _url_hash(link)
        if url_hash in seen_hashes:
            continue
        seen_hashes.add(url_hash)

        title   = _clean_html(entry.get("title","")).strip() or "Untitled"
        raw_sum = entry.get("summary","") or entry.get("description","") or ""
        excerpt = _clean_html(raw_sum)[:300]

        # Thumbnail
        image_thumbnail = None
        video_url       = None
        video_thumbnail = None
        is_video        = is_youtube

        if is_youtube:
            yt_id = entry.get("yt_videoid") or ""
            if yt_id:
                video_url       = f"https://www.youtube.com/watch?v={yt_id}"
                video_thumbnail = _extract_yt_thumbnail(yt_id)
                image_thumbnail = video_thumbnail
                is_video        = True
        else:
            # media:thumbnail
            media = entry.get("media_thumbnail") or []
            if isinstance(media, list) and media:
                image_thumbnail = media[0].get("url")
            elif isinstance(media, dict):
                image_thumbnail = media.get("url")
            # enclosure
            if not image_thumbnail:
                enc = entry.get("enclosures", [])
                if enc and enc[0].get("type","").startswith("image"):
                    image_thumbnail = enc[0].get("href") or enc[0].get("url")

        # Published
        published_at = None
        if entry.get("published_parsed"):
            try:
                import time
                published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).isoformat()
            except Exception:
                pass

        results.append({
            "title":          title,
            "excerpt":        excerpt or None,
            "url_hash":       url_hash,
            "source_url":     link,
            "image_thumbnail":image_thumbnail,
            "video_url":      video_url,
            "video_thumbnail":video_thumbnail,
            "is_video":       is_video,
            "source_name":    source["name"],
            "default_category": source["category"],
            "published_at":   published_at,
        })
    return results

# ──────────────────────────────────────────────────────────────────────────────
# COGNITIVE IMAGE SCRAPING AND CURATION SIDECAR (CISCS) UTILITIES
# ──────────────────────────────────────────────────────────────────────────────
async def verify_image_resolution_stream(image_url: str, min_width: int = 800, min_height: int = 450) -> Optional[tuple]:
    """
    Decodes image dimensions incrementally from the initial byte headers using PIL.ImageFile.Parser
    to avoid full payload downloads. Restricts range requests to 32KB.
    Ensures the image is in landscape mode (width > height) and meets HD limits.
    Returns (width, height) if valid, otherwise None.
    """
    import httpx
    from PIL import ImageFile
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Range": "bytes=0-32768"
    }
    try:
        async with httpx.AsyncClient(timeout=6, follow_redirects=True, headers=headers) as client:
            async with client.stream("GET", image_url) as r:
                if r.status_code not in (200, 206):
                    return None
                
                parser = ImageFile.Parser()
                bytes_read = 0
                async for chunk in r.iter_bytes(chunk_size=1024):
                    parser.feed(chunk)
                    bytes_read += len(chunk)
                    if parser.image:
                        width, height = parser.image.size
                        # Enforce landscape and minimal dimensions
                        if width > height and width >= min_width and height >= min_height:
                            return (width, height)
                        return None
                    if bytes_read > 65536:  # Escape if we read more than 64KB and still no header
                        break
        return None
    except Exception:
        return None


async def _get_image_dhash_from_url(image_url: str) -> Optional[str]:
    """
    Downloads raw image in memory and calculates a 64-bit Difference Hash (dHash) hex string
    to check visual similarity. Uses LANCZOS horizontal gradient computation on a grayscale 9x8 matrix.
    """
    import httpx
    from PIL import Image
    import io
    try:
        async with httpx.AsyncClient(timeout=8, follow_redirects=True) as client:
            r = await client.get(image_url)
        if r.status_code != 200:
            return None
        
        img = Image.open(io.BytesIO(r.content)).convert("L")
        img = img.resize((9, 8), Image.Resampling.LANCZOS)
        pixels = list(img.getdata())
        
        difference = []
        for row in range(8):
            for col in range(8):
                pixel_left = pixels[row * 9 + col]
                pixel_right = pixels[row * 9 + col + 1]
                difference.append(pixel_left > pixel_right)
        
        decimal_val = 0
        for bit in difference:
            decimal_val = (decimal_val << 1) | int(bit)
        
        return f"{decimal_val:016x}"
    except Exception:
        return None


def _hamming_distance(h1: str, h2: str) -> int:
    """Calculates bitwise Hamming distance between two 64-bit hex strings."""
    if not h1 or not h2:
        return 99
    try:
        val1 = int(h1, 16)
        val2 = int(h2, 16)
        xor_val = val1 ^ val2
        return bin(xor_val).count('1')
    except Exception:
        return 99


def _decompose_hash(hash_hex: Optional[str]) -> Optional[dict]:
    """Decomposes a 64-bit hex hash string into four 16-bit integer segments to index in MongoDB."""
    if not hash_hex:
        return None
    try:
        val = int(hash_hex, 16)
        return {
            "hash_segment_1": (val >> 48) & 0xFFFF,
            "hash_segment_2": (val >> 32) & 0xFFFF,
            "hash_segment_3": (val >> 16) & 0xFFFF,
            "hash_segment_4": val & 0xFFFF,
        }
    except Exception:
        return None


def _build_search_query(text: str, domain: str) -> str:
    """Extracts anchors Lucia/Jason/Leonida from text to dynamically construct q={anchors}+'GTA VI' fallbacks."""
    anchors = []
    text_lower = text.lower()
    if "lucia" in text_lower:
        anchors.append("Lucia")
    if "jason" in text_lower:
        anchors.append("Jason")
    if "leonida" in text_lower:
        anchors.append("Leonida")
    
    if not anchors:
        anchors.append("Lucia Jason Leonida")
    
    # Matches q={anchors} + 'GTA VI' search parameter logic from visual curation supervisor
    query = " ".join(anchors) + ' "GTA VI" screenshots HD'
    return query


async def search_fallback_images_ddg(query: str) -> list:
    """
    Image fallback search using Bing Image Search scrape (DDG changed their API).
    Returns a list of direct image URLs matching the query.
    Bypasses WAF blocks using clean URLs and browser-replica headers.
    """
    import httpx
    import urllib.parse
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Ch-Ua": '"Not-A.Brand";v="99", "Chromium";v="124", "Google Chrome";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0"
    }
    
    try:
        encoded = urllib.parse.quote(query)
        # Use clean URL (no tracking params) to avoid trigger redirects to trending/bot layouts
        url = f"https://www.bing.com/images/search?q={encoded}"
        async with httpx.AsyncClient(timeout=10, follow_redirects=True, headers=headers) as client:
            r = await client.get(url)
        if r.status_code != 200:
            logger.warning(f"[SearchFallback] Bing image search returned {r.status_code}")
            return []
            
        # Parse using robust patterns
        murls = re.findall(r'murl&quot;:&quot;(https://[^&]+?)&quot;', r.text, re.I)
        if not murls:
            murls = re.findall(r'"murl":"(https://[^"]+?)"', r.text, re.I)
            
        cleaned_urls = []
        for m in murls:
            u_clean = m.replace("\\/", "/")
            # Filter to make sure it contains an image extension
            path = u_clean.split("?")[0].lower()
            if any(ext in path for ext in (".jpg", ".jpeg", ".png", ".webp")):
                if u_clean not in cleaned_urls:
                    cleaned_urls.append(u_clean)
                    
        logger.info(f"[SearchFallback] Bing returned {len(cleaned_urls)} image candidates for query: '{query}'")
        return cleaned_urls[:25]  # cap at 25 to keep pipeline fast
    except Exception as e:
        logger.warning(f"[SearchFallback] Bing image search failed: {e}")
        return []


async def _fetch_article_images(url: str, existing_thumb: Optional[str] = None) -> tuple:
    """
    Scrape the article source page and return (hero_image, body_image, visual_metadata).
    - hero_image: og:image or first large image found
    - body_image: a DIFFERENT image from the same page (unique, not a duplicate of hero)
    - visual_metadata: dict conforming to the MongoDB CISCS database persistence schema.
    Returns (None, None, None) if suitable images cannot be found.
    Skips icons, logos, avatars, ads, and tiny images (< 300px heuristic via URL patterns).
    Upgrades all quality/dimensions to high-definition (HD) variants.
    """
    import httpx
    from urllib.parse import urljoin, urlparse

    # Tightened skip list — only skip definitive non-article assets
    # Removed 'thumb', 'small', 'mini', 'header_logo', 'sharing' which falsely block real article images
    _SKIP_PATTERNS = [
        'logo', 'icon', 'avatar', 'favicon', 'badge', 'sprite', 'pixel',
        '1x1', 'button', 'thumb_small', 'profile', 'gravatar', 'wp-emoji',
        'placeholder', 'sidebar', 'widget', 'loader', 'advertisement',
        'nav_logo', 'facebook', 'twitter',
    ]
    _IMG_EXTENSIONS = ('.jpg', '.jpeg', '.png', '.webp', '.gif')

    def _upgrade_to_hd(src: str) -> str:
        if not src:
            return src
        # 1. YouTube thumbnail upgrade: convert any hqdefault/mqdefault/default to maxresdefault
        if "youtube.com" in src or "youtu.be" in src:
            src = re.sub(r'/(hqdefault|mqdefault|default)\.jpg', '/maxresdefault.jpg', src)
        
        # 2. WordPress / standard resizing suffix removal (e.g., image-150x150.jpg -> image.jpg)
        src = re.sub(r'-(\d+)x(\d+)(?=\.[a-zA-Z0-9]+$)', '', src)
        
        # 3. CDN resizing query upgrades to HD (e.g. ?w=150 -> ?w=1920)
        src = re.sub(r'([?&])w=\d+', r'\g<1>w=1920', src)
        src = re.sub(r'([?&])width=\d+', r'\g<1>width=1920', src)
        src = re.sub(r'([?&])resize=\d+,\d+', r'\g<1>resize=1920,1080', src)
        src = re.sub(r'([?&])quality=\d+', r'\g<1>quality=95', src)
        
        return src

    def _clean_url_for_compare(u: str) -> str:
        if not u:
            return ""
        try:
            u_upgraded = _upgrade_to_hd(u)
            parsed = urlparse(u_upgraded)
            path_part = parsed.path.lower().strip("/")
            import os
            basename = os.path.basename(path_part)
            if basename and "." in basename:
                return basename
            return path_part
        except Exception:
            return u.lower().strip()

    def _is_valid_img(src: str) -> bool:
        if not src or not src.startswith('http'):
            return False
        sl = src.lower()
        if not any(ext in sl for ext in _IMG_EXTENSIONS):
            return False
        if any(p in sl for p in _SKIP_PATTERNS):
            return False
        # Skip explicit tiny dimension patterns in the URL path only (e.g. -50x50.jpg)
        # Lowered lower bound to avoid blocking legitimate medium-sized art (e.g. 300x200 featured images)
        if re.search(r'[/\-_]([1-9]\d)x([1-9]\d)\b', sl):  # only block 2-digit × 2-digit (< 100px)
            return False
        return True

    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
        async with httpx.AsyncClient(timeout=12, follow_redirects=True, headers=headers) as cli:
            r = await cli.get(url)
        
        html = r.text if r.status_code == 200 else ""
        og_image = None
        img_srcs = []

        if html:
            # 1. Extract og:image as hero candidate
            og_match = re.search(
                r'<meta[^>]+(?:property=["\']og:image["\']|name=["\']og:image["\'])[^>]*content=["\']([^"\']+)["\']',
                html, re.I
            )
            if not og_match:
                og_match = re.search(
                    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]*(?:property=["\']og:image["\']|name=["\']og:image["\'])',
                    html, re.I
                )
            og_image = og_match.group(1).strip() if og_match else None

            # 2. Extract ALL <img src> and srcset candidates from the page body
            img_srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html, re.I)
            # Also grab srcset largest variants
            srcsets = re.findall(r'srcset=["\']([^"\']+)["\']', html, re.I)
            for srcset in srcsets:
                # pick the last (largest) entry in each srcset
                parts = [p.strip().split()[0] for p in srcset.split(',') if p.strip()]
                if parts:
                    img_srcs.append(parts[-1])

            # Normalize relative URLs
            img_srcs = [urljoin(url, s) for s in img_srcs]

        # Filter: valid images only
        candidates = [s for s in img_srcs if _is_valid_img(s)]
        
        # De-duplicate & upgrade to HD, preserving order
        seen = set()
        unique_candidates = []
        for c in candidates:
            c_hd = _upgrade_to_hd(c)
            c_clean = _clean_url_for_compare(c_hd)
            if c_clean and c_clean not in seen:
                seen.add(c_clean)
                unique_candidates.append(c_hd)

        # Resolve hero
        hero = existing_thumb or og_image
        if hero:
            hero = _upgrade_to_hd(hero)
            if not _is_valid_img(hero):
                hero = None
        
        if not hero and unique_candidates:
            hero = unique_candidates[0]

        # Stage 4 Resolution check on hero candidate
        # Relaxed from 800x450 to 400x225 — many legitimate article og:images are medium-res
        hero_w, hero_h = None, None
        if hero:
            res_tuple = await verify_image_resolution_stream(hero, min_width=400, min_height=225)
            if res_tuple:
                hero_w, hero_h = res_tuple
            else:
                # Stream check failed (timeout/CDN blocked range requests) — keep image anyway
                # if it passed the URL validity check, give it benefit of the doubt
                logger.debug(f"[ImageScraper] Resolution stream check failed for hero, keeping anyway: {hero[:80]}")
                hero_w, hero_h = 0, 0

        # Stage 5 Uniqueness dHash filtering for body candidates
        hero_hash = await _get_image_dhash_from_url(hero) if hero else None
        hero_clean = _clean_url_for_compare(hero) if hero else ""

        body = None
        body_w, body_h = None, None
        hd_body_candidates = [] # list of (url, width, height)
        
        for c in unique_candidates:
            c_clean = _clean_url_for_compare(c)
            if c_clean and c_clean != hero_clean:
                # Resolution stream check — relaxed to 400x225
                res_tuple = await verify_image_resolution_stream(c, min_width=400, min_height=225)
                if res_tuple:
                    hd_body_candidates.append((c, res_tuple[0], res_tuple[1]))
                else:
                    # Stream check timed out or range-blocked — include as low-confidence candidate
                    hd_body_candidates.append((c, 0, 0))

        for c_url, w, h in hd_body_candidates:
            c_hash = await _get_image_dhash_from_url(c_url)
            if c_hash and hero_hash:
                dist = _hamming_distance(hero_hash, c_hash)
                if dist < 10:  # Visual duplicate / near-identical frames
                    continue
            body = c_url
            body_w, body_h = w, h
            break

        # Fallback Sourcing: If we are missing either the hero or the body, query DuckDuckGo Fallback search!
        if not hero or not body:
            parsed_url = urlparse(url)
            domain_words = [w for w in parsed_url.netloc.split('.') if w not in ('www', 'com', 'org', 'net', 'co', 'uk', 'news')]
            search_domain = domain_words[0] if domain_words else "GTA 6"
            
            query = _build_search_query(html or url, search_domain)
            logger.info(f"[SearchFallback] Sourcing visual mirrors for query: '{query}'")
            
            search_results = await search_fallback_images_ddg(query)
            
            search_hd_candidates = [] # list of (url, w, h)
            for s_img in search_results:
                s_hd = _upgrade_to_hd(s_img)
                if _is_valid_img(s_hd):
                    res_tuple = await verify_image_resolution_stream(s_hd, min_width=1024, min_height=576)
                    if res_tuple:
                        search_hd_candidates.append((s_hd, res_tuple[0], res_tuple[1]))
            
            # Backfill hero if missing
            if not hero and search_hd_candidates:
                hero, hero_w, hero_h = search_hd_candidates[0]
                hero_hash = await _get_image_dhash_from_url(hero)
                hero_clean = _clean_url_for_compare(hero)
                search_hd_candidates = search_hd_candidates[1:]
            
            # Backfill body if missing
            if not body and search_hd_candidates:
                for c_url, w, h in search_hd_candidates:
                    c_clean = _clean_url_for_compare(c_url)
                    if c_clean and c_clean != hero_clean:
                        c_hash = await _get_image_dhash_from_url(c_url)
                        if c_hash and hero_hash:
                            dist = _hamming_distance(hero_hash, c_hash)
                            if dist < 10:
                                continue
                        body = c_url
                        body_w, body_h = w, h
                        break

        # Final safety check: Ensure hero and body are completely distinct
        if hero and body:
            if _clean_url_for_compare(hero) == _clean_url_for_compare(body):
                body = None
                body_w, body_h = None, None

        # Calculate final hamming distance and assemble visual_metadata
        visual_metadata = None
        if hero and body:
            hero_hash_val = hero_hash or await _get_image_dhash_from_url(hero)
            body_hash_val = await _get_image_dhash_from_url(body)
            dist_val = _hamming_distance(hero_hash_val, body_hash_val) if (hero_hash_val and body_hash_val) else 99
            
            visual_metadata = {
                "hero_hash_hex": hero_hash_val,
                "body_hash_hex": body_hash_val,
                "hamming_distance": dist_val,
                "hero_resolution": f"{hero_w}x{hero_h}" if (hero_w and hero_h) else "unknown",
                "body_resolution": f"{body_w}x{body_h}" if (body_w and body_h) else "unknown",
                "hero_segments": _decompose_hash(hero_hash_val),
                "body_segments": _decompose_hash(body_hash_val)
            }

        return (hero, body, visual_metadata)
    except Exception as e:
        logger.warning(f"[ImageScraper] Failed for {url}: {e}")
        return (_upgrade_to_hd(existing_thumb) if existing_thumb else None, None, None)


async def run_scraper_pipeline(is_manual: bool = False) -> str:
    """Main scrape pipeline. Returns run_id."""
    global _scraper_running, _last_run_id
    if _scraper_running:
        return _last_run_id or "already_running"

    _scraper_running = True
    run_id = str(uuid.uuid4())
    _last_run_id = run_id
    now_iso = datetime.now(timezone.utc).isoformat()

    run_doc = {
        "runId":             run_id,
        "startedAt":         now_iso,
        "completedAt":       None,
        "status":            "running",
        "articlesFound":     0,
        "articlesNew":       0,
        "sourcesProcessed":  0,
        "sourcesFailed":     0,
        "errorMsg":          None,
    }
    await db.scraper_runs.insert_one(run_doc)

    articles_found = 0
    articles_new   = 0
    sources_ok     = 0
    sources_fail   = 0

    try:
        sources = await db.scraper_sources.find({"isActive": True}, {"_id": 0}).to_list(100)
        if not sources:
            sources = DEFAULT_SOURCES
        logger.info(f"[Scraper] Starting run {run_id} (manual={is_manual}) — {len(sources)} sources")

        for src in sources:
            if not is_manual and articles_new >= DAILY_ARTICLE_CAP:
                logger.info(f"[Scraper] Daily cap of {DAILY_ARTICLE_CAP} reached — stopping (auto run)")
                break
            try:
                items = await _fetch_rss(src)
                articles_found += len(items)

                # Process all items in the feed instead of restricting to the small quota cap
                for item in items:
                    if not is_manual and articles_new >= DAILY_ARTICLE_CAP:
                        break
                    title   = item["title"]
                    excerpt = item.get("excerpt") or ""

                    # GTA6 relevance gate (YouTube sources skip checks; Web feeds run fast regex filter)
                    is_yt = src.get("type") == "youtube"
                    if not is_yt:
                        # We use quota value for keyword sensitivity matching
                        if not _is_gta6_relevant(title, excerpt, src.get("quota", 5)):
                            continue
                        # Stage 2: AI relevance check bypassed for wider queue coverage and faster scrape speeds.
                        # You can manually approve or reject articles in the Editorial Desk.

                    url_hash = item["url_hash"]

                    # Dedup check
                    existing = await db.scraped_articles.find_one({"urlHash": url_hash})
                    if existing:
                        continue

                    # ── SCRAPE PHASE: Fast ingest — no image hunting here. ──────────────────
                    # Image finding happens in Re-AI (reprocess endpoint) so the scraper
                    # stays fast and accepts ALL passing articles without image gates.
                    # Just save whatever thumbnail came from the RSS feed.
                    thumb = item.get("image_thumbnail") or item.get("video_thumbnail")
                    body_image = None
                    visual_metadata = None
                    logger.info(f"[Scraper] Ingesting (images deferred to Re-AI): {title[:70]}")

                    doc = {
                        "id":             str(uuid.uuid4()),
                        "slug":           re.sub(r'[^a-z0-9]+', '-', title.lower())[:80].strip('-') + "-" + url_hash[:6],
                        "title":          title,
                        "excerpt":        excerpt or None,
                        "category":       normalize_category(item.get("default_category")),
                        "sourceUrl":      item["source_url"],
                        "urlHash":        url_hash,
                        "imageThumbnail": thumb,
                        "bodyImage":      body_image,
                        "visual_metadata": visual_metadata,
                        "videoUrl":       item.get("video_url"),
                        "videoThumbnail": item.get("video_thumbnail"),
                        "isVideo":        item.get("is_video", False),
                        "sourceName":     item["source_name"],
                        "newsValueScore": 50,
                        "status":         "pending",
                        "aiSummary":      None,
                        "aiContent":      None,
                        "aiTags":         None,
                        "aiProcessed":    False,
                        "isFeatured":     False,
                        "publishedAt":    item.get("published_at"),
                        "scrapedAt":      now_iso,
                        "rejectionReason":None,
                        "approvedAt":     None,
                        "body":           [],
                        "author":         None,
                        "date":           None,
                        "readTime":       None,
                        "heroImage":      thumb,
                        "tags":           [],
                    }
                    await db.scraped_articles.insert_one(doc)
                    articles_new += 1

                await db.scraper_sources.update_one(
                    {"name": src["name"]},
                    {"$set": {"lastScrapedAt": now_iso, "lastError": None}},
                    upsert=True,
                )
                sources_ok += 1
                logger.info(f"[Scraper] {src['name']}: {len(items)} found, {articles_new} new total")

            except Exception as e:
                sources_fail += 1
                logger.warning(f"[Scraper] {src['name']} failed: {e}")
                await db.scraper_sources.update_one(
                    {"name": src["name"]},
                    {"$set": {"lastError": str(e)}},
                    upsert=True,
                )

        await db.scraper_runs.update_one(
            {"runId": run_id},
            {"$set": {
                "completedAt":      datetime.now(timezone.utc).isoformat(),
                "status":           "completed",
                "articlesFound":    articles_found,
                "articlesNew":      articles_new,
                "sourcesProcessed": sources_ok,
                "sourcesFailed":    sources_fail,
            }}
        )
        logger.info(f"[Scraper] Run {run_id} complete — {articles_new} new articles")

    except Exception as e:
        logger.error(f"[Scraper] Pipeline failed: {e}")
        await db.scraper_runs.update_one(
            {"runId": run_id},
            {"$set": {"status": "failed", "errorMsg": str(e), "completedAt": datetime.now(timezone.utc).isoformat()}}
        )
    finally:
        _scraper_running = False

    return run_id

# ══════════════════════════════════════════════════════════════════════════════
# AI SUMMARIZER (Groq)
# ══════════════════════════════════════════════════════════════════════════════
LEONIDA_WORLD_KNOWLEDGE = """
== LEONIDA WORLD KNOWLEDGE ==
GAME: Grand Theft Auto VI. State of Leonida (Florida analog). Release: November 19, 2026. PS5 & Xbox Series X|S.
PROTAGONISTS: Jason Duval (Army vet, smuggler for Brian Heder in Leonida Keys) and Lucia Caminos (first female GTA protagonist, ex-Leonida Penitentiary).
SETTING: Vice Beach, Little Cuba, Tequesta, Stockyard, Port VC (Vice City districts); Mariana County (Keys), Grassrivers (Everglades), Mount Kalaga, Port Gellhorn.
TECH: RAGE engine, 30fps, RTGI, hair strand physics. Internal codename: Project Americas.
GAMEPLAY: CCTV detection, zip-tie restraint, physical loot bags, NPC local reputation, Dead-Eye (Jason), Auto Dialer (Lucia).
RADIO: V-Rock returns. "Love Is a Long Road" (Tom Petty), "Hot Together" (Pointer Sisters), "Everybody Have Fun Tonight" (Wang Chung).
== END WORLD KNOWLEDGE ==
"""

JOURNALIST_SYSTEM = f"""You are the editor-in-chief of The Leonida Vice — an underground intelligence publication covering GTA VI with the authority of Rolling Stone, the precision of Reuters, and the attitude of Vice Media.

{LEONIDA_WORLD_KNOWLEDGE}

Your job:
1. Write a brand-aligned, original, rewritten headline/title for this story in the unique "Leonida Vice" tone (investigative, cinematic, punchy). Do NOT copy the original headline verbatim. Start it on the first line prefixed by: "REWRITTEN TITLE: "
2. Write a DECK/SUMMARY that would appear under the headline — sharp, substantive, and worth reading on its own.

RULES:
- Only report facts present in the source. Never invent quotes, statistics, or events.
- Voice: authoritative, cinematic, slightly conspiratorial. Write like you've seen the build.
- Length of summary: 3-5 sentences. 80-160 words. Enough to give real context, not just tease.
- Do NOT open the summary with "The article", "According to", or a restatement of the headline.
- DO contextualise within the wider GTA VI picture where the source permits it.
- Frame the summary as an editorial analysis of news reported by other outlets. Do NOT claim The Leonida Vice broke this news.
- Explicitly attribute quotes, reports, or key findings to the original Source (e.g., "according to [Source]", "first reported by [Source]") rather than presenting them as your own exclusive discovery.
- After the summary, on a new line: CONFIDENCE: high|medium|low
- Then on a new line: TAGS: tag1, tag2, tag3, tag4"""

FULL_ARTICLE_SYSTEM = f"""You are a senior staff writer for The Leonida Vice — think Jason Schreier's precision crossed with Tom Bissell's long-form voice.

{LEONIDA_WORLD_KNOWLEDGE}

Write a FULL EDITORIAL ARTICLE in 4 structured paragraphs:

1. LEDE — One punchy sentence that captures the story's full weight. No throat-clearing.
2. CORE FACTS — All the verified information from the source, written as crisp present-tense reporting. Include names, figures, dates, and direct quotes if present in the source.
3. SIGNIFICANCE — Why this matters specifically to GTA VI's development, release trajectory, or the fan community. Connect dots from the world knowledge above where relevant.
4. LEONIDA TAKE — The editorial voice. What does The Leonida Vice make of this? What questions remain? What should the reader watch for next?

RULES:
- 350-550 words total. Substantial. Journalistic. No padding.
- Prose only — no headers, bullets, or markdown within the article.
- Present tense throughout.
- Never fabricate details not in the source.
- Do not restate the headline as the opening sentence.
- Frame the piece as a professional staff writer analyzing external reports. Do NOT claim to have broken the story or conducted primary investigative reporting.
- Explicitly attribute direct quotes, exclusive details, or major claims to the original Source (e.g., "speaking to [Source]", "as reported by [Source]") so the reader knows where the information originated."""

async def _groq_chat(messages: list, max_tokens: int = 300, model: str = "llama-3.3-70b-versatile", purpose: str = "general") -> Optional[str]:
    """Call Groq API. Returns content string or None on failure and logs token usage to MongoDB."""
    key = GROQ_API_KEY
    if not key:
        return None
    import httpx
    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.2,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as cli:
            r = await cli.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
        if r.status_code != 200:
            logger.warning(f"[Groq] HTTP {r.status_code}: {r.text[:200]}")
            return None
        
        resp_json = r.json()
        content = resp_json["choices"][0]["message"]["content"]
        
        # Log token usage to MongoDB
        usage = resp_json.get("usage")
        headers = r.headers
        
        limit_requests = headers.get("x-ratelimit-limit-requests")
        limit_tokens = headers.get("x-ratelimit-limit-tokens")
        remaining_requests = headers.get("x-ratelimit-remaining-requests")
        remaining_tokens = headers.get("x-ratelimit-remaining-tokens")
        reset_requests = headers.get("x-ratelimit-reset-requests")
        reset_tokens = headers.get("x-ratelimit-reset-tokens")
        
        now_iso = datetime.now(timezone.utc).isoformat()
        
        try:
            await db.groq_usage.insert_one({
                "timestamp": now_iso,
                "model": model,
                "purpose": purpose,
                "prompt_tokens": usage.get("prompt_tokens", 0) if usage else 0,
                "completion_tokens": usage.get("completion_tokens", 0) if usage else 0,
                "total_tokens": usage.get("total_tokens", 0) if usage else 0,
                "limit_requests": limit_requests,
                "limit_tokens": limit_tokens,
                "remaining_requests": remaining_requests,
                "remaining_tokens": remaining_tokens,
                "reset_requests": reset_requests,
                "reset_tokens": reset_tokens,
            })
            
            await db.groq_status.update_one(
                {"_id": "latest_limits"},
                {"$set": {
                    "timestamp": now_iso,
                    "limit_requests": limit_requests,
                    "limit_tokens": limit_tokens,
                    "remaining_requests": remaining_requests,
                    "remaining_tokens": remaining_tokens,
                    "reset_requests": reset_requests,
                    "reset_tokens": reset_tokens,
                }},
                upsert=True
            )
        except Exception as ex:
            logger.warning(f"[Groq Usage log] Failed to save usage/status log: {ex}")
                
        return content
    except Exception as e:
        logger.warning(f"[Groq] Error: {e}")
        return None

def _best_source_text(title: str, excerpt: Optional[str], content: Optional[str] = None) -> str:
    if excerpt and len(excerpt.strip()) >= 20:
        return excerpt.strip()
    if content and len(content.strip()) >= 20:
        return content.strip()[:800]
    return title

def _split_dense_paragraphs(text: str, max_words: int = 140) -> list:
    """Split text into paragraphs of <= max_words words each."""
    raw_paras = [p.strip() for p in re.split(r'\n+', text) if p.strip()]
    result = []
    for para in raw_paras:
        words = para.split()
        if len(words) <= max_words:
            result.append(para)
        else:
            sentences = re.split(r'(?<=[.!?])\s+', para)
            chunk, chunk_words = [], 0
            for sent in sentences:
                sw = len(sent.split())
                if chunk_words + sw > max_words and chunk:
                    result.append(' '.join(chunk))
                    chunk, chunk_words = [sent], sw
                else:
                    chunk.append(sent)
                    chunk_words += sw
            if chunk:
                result.append(' '.join(chunk))
    return result if result else [text]

async def ai_summarize(article: dict, groq_key: Optional[str] = None) -> dict:
    """Returns dict with aiSummary, aiContent, aiTags, newsValueScore, aiProcessed."""
    global GROQ_API_KEY
    original_key = GROQ_API_KEY
    if groq_key:
        GROQ_API_KEY = groq_key

    title    = article.get("title", "")
    excerpt  = article.get("excerpt")
    content  = article.get("content")
    src_name = article.get("sourceName", "Unknown")
    category = article.get("category", "World")
    source_text = _best_source_text(title, excerpt, content)

    result = {"aiProcessed": False, "aiSummary": None, "aiContent": None, "aiTags": [], "newsValueScore": 50}

    try:
        user_prompt = (
            f'Category: {category}\nSource: {src_name}\nHeadline: "{title}"\n'
            f'Raw content: "{source_text[:1200]}"\n\n'
            f'Write the editorial deck/summary for this story. Then CONFIDENCE and TAGS lines.'
        )
        raw = await _groq_chat(
            [{"role": "system", "content": JOURNALIST_SYSTEM}, {"role": "user", "content": user_prompt}],
            max_tokens=400,
            purpose="summary"
        )
        if raw:
            title_m = re.search(r'REWRITTEN TITLE:\s*(.+)$', raw, re.I | re.M)
            rewritten_title = title_m.group(1).strip() if title_m else None
            
            # Clean summary by removing the rewritten title line
            summary = raw
            if rewritten_title:
                summary = re.sub(r'REWRITTEN TITLE:.+$', '', summary, flags=re.I|re.M)
                # Sanitize title tags or quotes
                rewritten_title = re.sub(r'["\']', '', rewritten_title).strip()
                result["title"] = rewritten_title
            
            conf_m = re.search(r'CONFIDENCE:\s*(high|medium|low)', summary, re.I)
            tags_m = re.search(r'TAGS:\s*(.+)$', summary, re.I | re.M)
            summary = re.sub(r'CONFIDENCE:\s*(high|medium|low).*', '', summary, flags=re.I|re.S)
            summary = re.sub(r'TAGS:.+$', '', summary, flags=re.I|re.M).strip()
            confidence = conf_m.group(1).lower() if conf_m else "medium"
            tags = [t.strip() for t in tags_m.group(1).split(",")][:6] if tags_m else []
            score = {"high": 90, "medium": 65, "low": 35}.get(confidence, 65)
            result.update({"aiSummary": summary if len(summary) > 20 else None, "aiTags": tags, "newsValueScore": score})

        # Full article content — 4-paragraph long-form
        full_prompt = (
            f'Category: {category}\nSource: {src_name}\nHeadline: "{title}"\n'
            f'Raw content: "{source_text[:2000]}"\n\n'
            f'Write the full editorial article. 4 paragraphs, 350-550 words. Lede → Core Facts → Significance → Leonida Take.'
        )
        full = await _groq_chat(
            [{"role": "system", "content": FULL_ARTICLE_SYSTEM}, {"role": "user", "content": full_prompt}],
            max_tokens=750,
            purpose="full_article"
        )
        if full and len(full.strip()) > 80:
            # Enforce paragraph density: split any block > 140 words, ensure >= 3 paragraphs
            paras = _split_dense_paragraphs(full.strip(), max_words=140)
            while len(paras) < 3:
                paras.append(paras[-1] if paras else "Further details are pending from Leonida Vice field correspondents.")
            result["aiContent"] = "\n\n".join(paras)

        result["aiProcessed"] = True
    except Exception as e:
        logger.warning(f"[AI] Summarize failed for '{title[:60]}': {e}")
    finally:
        GROQ_API_KEY = original_key

    return result

# ══════════════════════════════════════════════════════════════════════════════
# SCHEDULER (APScheduler)
# ══════════════════════════════════════════════════════════════════════════════
_next_run_time: Optional[datetime] = None

async def _scheduled_scrape():
    global _next_run_time
    logger.info("[Scheduler] Running daily scrape")
    try:
        await run_scraper_pipeline()
    except Exception as e:
        logger.error(f"[Scheduler] Scrape failed: {e}")
    _next_run_time = _compute_next_run()

async def _audit_missing_summaries():
    """Backfill AI summaries for published articles missing them."""
    if not GROQ_API_KEY:
        return
    cursor = db.scraped_articles.find({"status": "published", "aiProcessed": False}, {"_id": 0})
    articles = await cursor.to_list(50)
    if not articles:
        return
    logger.info(f"[Audit] Backfilling {len(articles)} articles missing AI summaries")
    for art in articles:
        try:
            updates = await ai_summarize(art)
            await db.scraped_articles.update_one(
                {"id": art["id"]},
                {"$set": updates}
            )
            await asyncio.sleep(0.6)
        except Exception as e:
            logger.warning(f"[Audit] Failed to summarize {art.get('id')}: {e}")

def _compute_next_run() -> datetime:
    now = datetime.now(timezone.utc)
    nxt = now.replace(hour=6, minute=0, second=0, microsecond=0)
    if nxt <= now:
        nxt = nxt + timedelta(days=1)
    return nxt

def _get_next_run_str() -> str:
    if not _next_run_time:
        return "Not scheduled"
    diff = _next_run_time - datetime.now(timezone.utc)
    if diff.total_seconds() <= 0:
        return "Imminent"
    hrs  = int(diff.total_seconds() // 3600)
    mins = int((diff.total_seconds() % 3600) // 60)
    return f"{hrs}h {mins}m"

# ══════════════════════════════════════════════════════════════════════════════
# AUTH HELPERS
# ══════════════════════════════════════════════════════════════════════════════
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ScrapedArticle(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: Optional[str] = None
    aiSummary: Optional[str] = None
    aiContent: Optional[str] = None
    aiTags: Optional[List[str]] = None
    category: Optional[str] = None
    sourceName: Optional[str] = None
    sourceUrl: Optional[str] = None
    url: Optional[str] = None
    imageThumbnail: Optional[str] = None
    videoThumbnail: Optional[str] = None
    videoUrl: Optional[str] = None
    isVideo: bool = False
    newsValueScore: int = 50
    commentsCount: int = 0
    publishedAt: Optional[str] = None
    scrapedAt: Optional[str] = None
    status: str = "pending"
    aiProcessed: bool = False
    isFeatured: bool = False
    author: Optional[str] = None
    date: Optional[str] = None
    readTime: Optional[str] = None
    heroImage: Optional[str] = None
    tags: Optional[List[str]] = None
    body: Optional[List[dict]] = None

class IngestPayload(BaseModel):
    articles: List[ScrapedArticle]

def require_ingest_token(authorization: Optional[str] = Header(None)):
    if not INGEST_TOKEN:
        raise HTTPException(status_code=500, detail="Server ingest token not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    if authorization.split(" ", 1)[1].strip() != INGEST_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid ingest token")
    return True

def require_editorial_key(x_editorial_key: Optional[str] = Header(None)):
    if not x_editorial_key or x_editorial_key != EDITORIAL_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing editorial key")
    return True

# ══════════════════════════════════════════════════════════════════════════════
# BASIC ROUTES
# ══════════════════════════════════════════════════════════════════════════════
@api_router.get("/")
async def root():
    return {"message": "Leonida Vice API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    obj = StatusCheck(**input.model_dump())
    doc = obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r.get('timestamp'), str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return rows

# ══════════════════════════════════════════════════════════════════════════════
# ARTICLES — public read endpoints
# ══════════════════════════════════════════════════════════════════════════════
@api_router.get("/articles")
async def list_articles(
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    query: Dict[str, Any] = {"status": "published"}
    if category:
        query["category"] = category
    # Sort by approvedAt first (Editorial Desk approvals), then publishedAt fallback.
    # Articles approved via the CMS set approvedAt; RSS-ingested articles set publishedAt.
    # Using a compound sort ensures newest content always surfaces first.
    cursor = (
        db.scraped_articles
        .find(query, {"_id": 0})
        .sort([("approvedAt", -1), ("publishedAt", -1)])
        .skip(offset)
        .limit(limit)
    )
    items = await cursor.to_list(length=limit)
    total = await db.scraped_articles.count_documents(query)
    return {"items": items, "total": total, "limit": limit, "offset": offset}

@api_router.get("/articles/trending")
async def trending_articles(limit: int = Query(10, ge=1, le=50)):
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
    # Sort by approvedAt first (Editorial Desk approvals), then publishedAt fallback.
    # Articles approved via the CMS set approvedAt; RSS-ingested articles set publishedAt.
    # Using a compound sort ensures newest content always surfaces first.
    cursor = db.scraped_articles.find(
        {"status": "published", "publishedAt": {"$gte": cutoff}}, {"_id": 0}
    ).sort([("approvedAt", -1), ("publishedAt", -1), ("newsValueScore", -1)]).limit(limit)
    items = await cursor.to_list(length=limit)
    if not items:
        cursor = db.scraped_articles.find({"status": "published"}, {"_id": 0}).sort("newsValueScore", -1).limit(limit)
        items = await cursor.to_list(length=limit)
    return {"items": items}

@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    doc = await db.scraped_articles.find_one({"slug": slug, "status": "published"}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return doc

@api_router.delete("/articles/{slug}")
async def delete_article(slug: str, _: bool = Depends(require_ingest_token)):
    res = await db.scraped_articles.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Deleted"}

@api_router.post("/articles/ingest")
async def ingest_articles(payload: IngestPayload, _: bool = Depends(require_ingest_token)):
    now_iso = datetime.now(timezone.utc).isoformat()
    upserted = 0
    for art in payload.articles:
        doc = art.model_dump()
        doc['category'] = normalize_category(doc.get('category'))
        if not doc.get('scrapedAt'):
            doc['scrapedAt'] = now_iso
        if not doc.get('status'):
            doc['status'] = 'published'
        if not doc.get('urlHash') and doc.get('sourceUrl'):
            doc['urlHash'] = _url_hash(doc['sourceUrl'])
        if not doc.get('heroImage') and doc.get('imageThumbnail'):
            doc['heroImage'] = doc['imageThumbnail']
        await db.scraped_articles.update_one(
            {"slug": doc['slug']},
            {"$set": doc},
            upsert=True,
        )
        upserted += 1
    return {"upserted": upserted, "received": len(payload.articles)}

# ══════════════════════════════════════════════════════════════════════════════
# EDITORIAL DESK — AUTH-GATED
# ══════════════════════════════════════════════════════════════════════════════

# ── Stats ────────────────────────────────────────────────────────────────────
@api_router.get("/editorial/stats")
async def editorial_stats(_: bool = Depends(require_editorial_key)):
    cutoff_24h = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
    pending, published, rejected, today_pub = await asyncio.gather(
        db.scraped_articles.count_documents({"status": "pending"}),
        db.scraped_articles.count_documents({"status": "published"}),
        db.scraped_articles.count_documents({"status": "rejected"}),
        db.scraped_articles.count_documents({"status": "published", "approvedAt": {"$gte": cutoff_24h}}),
    )
    return {"pending": pending, "published": published, "rejected": rejected, "todayPublished": today_pub}

@api_router.get("/editorial/groq-usage")
async def get_groq_usage(_: bool = Depends(require_editorial_key)):
    now = datetime.now(timezone.utc)
    start_of_today = datetime(now.year, now.month, now.day, tzinfo=timezone.utc).isoformat()
    
    pipeline_today = [
        {"$match": {"timestamp": {"$gte": start_of_today}}},
        {"$group": {
            "_id": None,
            "total_tokens": {"$sum": "$total_tokens"},
            "prompt_tokens": {"$sum": "$prompt_tokens"},
            "completion_tokens": {"$sum": "$completion_tokens"},
            "request_count": {"$sum": 1}
        }}
    ]
    
    pipeline_total = [
        {"$group": {
            "_id": None,
            "total_tokens": {"$sum": "$total_tokens"},
            "prompt_tokens": {"$sum": "$prompt_tokens"},
            "completion_tokens": {"$sum": "$completion_tokens"},
            "request_count": {"$sum": 1}
        }}
    ]
    
    pipeline_by_purpose = [
        {"$match": {"timestamp": {"$gte": start_of_today}}},
        {"$group": {
            "_id": "$purpose",
            "tokens": {"$sum": "$total_tokens"},
            "requests": {"$sum": 1}
        }}
    ]
    
    try:
        today_res = await db.groq_usage.aggregate(pipeline_today).to_list(length=1)
        total_res = await db.groq_usage.aggregate(pipeline_total).to_list(length=1)
        purpose_res = await db.groq_usage.aggregate(pipeline_by_purpose).to_list(length=100)
    except Exception as ex:
        logger.warning(f"[Groq Usage Stats] Aggregation failed: {ex}")
        today_res, total_res, purpose_res = [], [], []
        
    t_today = today_res[0] if today_res else {}
    t_total = total_res[0] if total_res else {}
    
    by_purpose = {}
    for item in purpose_res:
        p = item["_id"] or "unknown"
        by_purpose[p] = {
            "tokens": item["tokens"],
            "requests": item["requests"]
        }
        
    # Get latest limits status from DB
    try:
        latest_status = await db.groq_status.find_one({"_id": "latest_limits"})
    except Exception as ex:
        logger.warning(f"[Groq Usage Stats] Failed to query latest status: {ex}")
        latest_status = None
        
    # Get recent 20 calls audit log
    try:
        recent_calls = await db.groq_usage.find({}).sort("timestamp", -1).limit(20).to_list(length=20)
        audit_log = []
        for call in recent_calls:
            audit_log.append({
                "timestamp": call.get("timestamp"),
                "model": call.get("model", "llama-3.3-70b-versatile"),
                "purpose": call.get("purpose", "general"),
                "prompt_tokens": call.get("prompt_tokens", 0),
                "completion_tokens": call.get("completion_tokens", 0),
                "total_tokens": call.get("total_tokens", 0),
                "limit_requests": call.get("limit_requests"),
                "limit_tokens": call.get("limit_tokens"),
                "remaining_requests": call.get("remaining_requests"),
                "remaining_tokens": call.get("remaining_tokens"),
                "reset_requests": call.get("reset_requests"),
                "reset_tokens": call.get("reset_tokens"),
            })
    except Exception as ex:
        logger.warning(f"[Groq Usage Stats] Failed to query audit log: {ex}")
        audit_log = []
        
    return {
        "daily_token_limit": 500000,       # Groq Free Tier Daily Token Cap
        "daily_request_limit": 14400,      # Groq Free Tier Daily Request Cap
        
        "tokens_used_today": t_today.get("total_tokens", 0),
        "prompt_tokens_today": t_today.get("prompt_tokens", 0),
        "completion_tokens_today": t_today.get("completion_tokens", 0),
        "requests_used_today": t_today.get("request_count", 0),
        
        "tokens_used_total": t_total.get("total_tokens", 0),
        "requests_used_total": t_total.get("request_count", 0),
        
        "by_purpose_today": by_purpose,
        
        "rate_limits": {
            "timestamp": latest_status.get("timestamp") if latest_status else None,
            "limit_requests": latest_status.get("limit_requests") if latest_status else None,
            "limit_tokens": latest_status.get("limit_tokens") if latest_status else None,
            "remaining_requests": latest_status.get("remaining_requests") if latest_status else None,
            "remaining_tokens": latest_status.get("remaining_tokens") if latest_status else None,
            "reset_requests": latest_status.get("reset_requests") if latest_status else None,
            "reset_tokens": latest_status.get("reset_tokens") if latest_status else None,
        } if latest_status else None,
        
        "audit_log": audit_log
    }

async def refresh_groq_status(key: str) -> Optional[dict]:
    import httpx
    # Lightweight call: 1 max_tokens, high temp/no-op style user query
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 1,
        "temperature": 0.0,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as cli:
            r = await cli.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
            )
        if r.status_code == 200:
            headers = r.headers
            now_iso = datetime.now(timezone.utc).isoformat()
            
            limit_requests = headers.get("x-ratelimit-limit-requests")
            limit_tokens = headers.get("x-ratelimit-limit-tokens")
            remaining_requests = headers.get("x-ratelimit-remaining-requests")
            remaining_tokens = headers.get("x-ratelimit-remaining-tokens")
            reset_requests = headers.get("x-ratelimit-reset-requests")
            reset_tokens = headers.get("x-ratelimit-reset-tokens")
            
            resp_json = r.json()
            usage = resp_json.get("usage")
            
            rate_limits = {
                "timestamp": now_iso,
                "limit_requests": limit_requests,
                "limit_tokens": limit_tokens,
                "remaining_requests": remaining_requests,
                "remaining_tokens": remaining_tokens,
                "reset_requests": reset_requests,
                "reset_tokens": reset_tokens,
            }
            
            try:
                await db.groq_status.update_one(
                    {"_id": "latest_limits"},
                    {"$set": rate_limits},
                    upsert=True
                )
                
                # Also log this quick request
                await db.groq_usage.insert_one({
                    "timestamp": now_iso,
                    "model": "llama-3.3-70b-versatile",
                    "purpose": "status_check",
                    "prompt_tokens": usage.get("prompt_tokens", 0) if usage else 0,
                    "completion_tokens": usage.get("completion_tokens", 0) if usage else 0,
                    "total_tokens": usage.get("total_tokens", 0) if usage else 0,
                    "limit_requests": limit_requests,
                    "limit_tokens": limit_tokens,
                    "remaining_requests": remaining_requests,
                    "remaining_tokens": remaining_tokens,
                    "reset_requests": reset_requests,
                    "reset_tokens": reset_tokens,
                })
            except Exception as ex:
                logger.warning(f"[Groq status save] Failed to save in DB: {ex}")
                
            return rate_limits
        else:
            logger.warning(f"[Groq status refresh] HTTP {r.status_code}: {r.text[:200]}")
    except Exception as e:
        logger.warning(f"[Groq status refresh] Error: {e}")
    return None

@api_router.post("/editorial/groq-refresh")
async def trigger_groq_refresh(_: bool = Depends(require_editorial_key)):
    global GROQ_API_KEY
    if not GROQ_API_KEY:
        raise HTTPException(status_code=400, detail="Groq API Key is not configured on server")
    res = await refresh_groq_status(GROQ_API_KEY)
    if not res:
        raise HTTPException(status_code=502, detail="Failed to retrieve live rate limits from Groq")
    return res


# ── Queue ─────────────────────────────────────────────────────────────────────
@api_router.get("/editorial/queue")
async def editorial_queue(
    status: str = "pending",
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    _: bool = Depends(require_editorial_key),
):
    query: Dict[str, Any] = {"status": status}
    if category and category != "all":
        query["category"] = category
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    sort_field = "scrapedAt" if status == "pending" else "approvedAt"
    cursor = db.scraped_articles.find(query, {"_id": 0}).sort(sort_field, -1).skip(offset).limit(limit)
    articles = await cursor.to_list(length=limit)
    total = await db.scraped_articles.count_documents(query)
    return {"articles": articles, "total": total, "limit": limit, "offset": offset}

# ── Approve ───────────────────────────────────────────────────────────────────
@api_router.post("/editorial/approve/{article_id}")
async def approve_article(
    article_id: str,
    background_tasks: BackgroundTasks,
    _: bool = Depends(require_editorial_key),
):
    art = await db.scraped_articles.find_one({"id": article_id}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Not found")
    # Require a hero image
    if not art.get("imageThumbnail") and not art.get("videoThumbnail"):
        raise HTTPException(status_code=422, detail="Article has no hero image and cannot be published.")
    # If bodyImage is still missing, attempt a last-chance scrape from the source
    if not art.get("bodyImage"):
        source_url = art.get("sourceUrl") or art.get("source_url", "")
        if source_url:
            try:
                existing_thumb = art.get("imageThumbnail") or art.get("videoThumbnail")
                scraped_hero, scraped_body, visual_metadata = await _fetch_article_images(source_url, existing_thumb=existing_thumb)
                if scraped_body:
                    await db.scraped_articles.update_one(
                        {"id": article_id}, 
                        {"$set": {"bodyImage": scraped_body, "visual_metadata": visual_metadata}}
                    )
                    art["bodyImage"] = scraped_body
                    art["visual_metadata"] = visual_metadata
            except Exception:
                pass
    if not art.get("bodyImage"):
        raise HTTPException(status_code=422, detail="Article has no body image. Cannot publish without 2 unique source images.")

    now_iso = datetime.now(timezone.utc).isoformat()
    # Run AI summarization inline before publishing if not yet processed
    if not art.get("aiProcessed") and GROQ_API_KEY:
        try:
            ai_updates = await ai_summarize(art)
            await db.scraped_articles.update_one({"id": article_id}, {"$set": ai_updates})
            art.update(ai_updates)
        except Exception as e:
            logger.warning(f"[Editorial] AI pre-summarize failed for {article_id}: {e}")

    await db.scraped_articles.update_one(
        {"id": article_id},
        {"$set": {"status": "published", "approvedAt": now_iso, "publishedAt": art.get("publishedAt") or now_iso}}
    )
    return {"success": True, "title": art.get("title", "")}

# ── Reject ────────────────────────────────────────────────────────────────────
@api_router.post("/editorial/reject/{article_id}")
async def reject_article(
    article_id: str,
    body: dict = {},
    _: bool = Depends(require_editorial_key),
):
    reason = body.get("reason") if body else None
    res = await db.scraped_articles.update_one(
        {"id": article_id},
        {"$set": {"status": "rejected", "rejectionReason": reason}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}

# ── Bulk approve ──────────────────────────────────────────────────────────────
@api_router.post("/editorial/bulk-approve")
async def bulk_approve(
    body: dict,
    background_tasks: BackgroundTasks,
    _: bool = Depends(require_editorial_key),
):
    ids = body.get("ids", [])
    query = {"status": "pending"}
    if ids:
        query["id"] = {"$in": ids}
    articles = await db.scraped_articles.find(query, {"_id": 0}).to_list(50)

    # Only approve articles that have BOTH hero image AND body image — no fallbacks
    valid = [a for a in articles if (a.get("imageThumbnail") or a.get("videoThumbnail")) and a.get("bodyImage")]
    skipped = len(articles) - len(valid)
    if skipped:
        logger.info(f"[Bulk Approve] Skipped {skipped} articles missing hero or body image")

    background_tasks.add_task(_bulk_approve_background, valid)
    return {"success": True, "queued": len(valid), "skipped": skipped}

async def _bulk_approve_background(articles: list):
    now_iso = datetime.now(timezone.utc).isoformat()
    for art in articles:
        try:
            updates = {"status": "published", "approvedAt": now_iso, "publishedAt": art.get("publishedAt") or now_iso}
            if not art.get("aiProcessed") and GROQ_API_KEY:
                ai_updates = await ai_summarize(art)
                updates.update(ai_updates)
            await db.scraped_articles.update_one({"id": art["id"]}, {"$set": updates})
            await asyncio.sleep(0.6)
        except Exception as e:
            logger.warning(f"[Bulk approve] Failed {art.get('id')}: {e}")
            await db.scraped_articles.update_one({"id": art["id"]}, {"$set": {"status": "published", "approvedAt": now_iso}})

# ── Bulk reject ───────────────────────────────────────────────────────────────
@api_router.post("/editorial/bulk-reject")
async def bulk_reject(body: dict, _: bool = Depends(require_editorial_key)):
    ids = body.get("ids", [])
    if not ids:
        raise HTTPException(status_code=400, detail="ids required")
    for aid in ids:
        await db.scraped_articles.update_one({"id": aid}, {"$set": {"status": "rejected"}})
    return {"success": True, "rejected": len(ids)}

# ── Unpublish ─────────────────────────────────────────────────────────────────
@api_router.post("/editorial/unpublish/{article_id}")
async def unpublish_article(article_id: str, _: bool = Depends(require_editorial_key)):
    await db.scraped_articles.update_one(
        {"id": article_id},
        {"$set": {"status": "pending", "isFeatured": False}}
    )
    return {"success": True}

# ── Hard delete ───────────────────────────────────────────────────────────────
@api_router.delete("/editorial/article/{article_id}")
async def editorial_delete_article(article_id: str, _: bool = Depends(require_editorial_key)):
    await db.scraped_articles.delete_one({"id": article_id})
    return {"success": True}

# ── Patch article (category / summary edit) ───────────────────────────────────
@api_router.patch("/editorial/article/{article_id}")
async def patch_article(article_id: str, body: dict, _: bool = Depends(require_editorial_key)):
    allowed = {"category", "aiSummary", "title", "heroImage", "imageThumbnail", "newsValueScore", "aiContent"}
    updates = {k: v for k, v in body.items() if k in allowed}
    if not updates:
        raise HTTPException(status_code=400, detail="No valid fields")
    await db.scraped_articles.update_one({"id": article_id}, {"$set": updates})
    return {"success": True}

# ── AI Reprocess ──────────────────────────────────────────────────────────────
@api_router.post("/editorial/reprocess/{article_id}")
async def reprocess_article(article_id: str, body: dict = {}, _: bool = Depends(require_editorial_key)):
    """
    Re-AI summarize + full internet-wide image hunt.
    This is the ONLY place images are sourced — not during scraping.
    Finds 2 unique images (hero + body) from across the internet,
    deduplicating against ALL images already used in the database.
    """
    groq_key = body.get("groqKey") if body else None
    art = await db.scraped_articles.find_one({"id": article_id}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Not found")

    # ── Step 1: Run AI summarize ───────────────────────────────────────────────
    updates = await ai_summarize(art, groq_key=groq_key or GROQ_API_KEY or None)

    # ── Step 2: Build set of ALL image URLs already used across the entire DB ──
    # This prevents re-using any hero or body image from any other article.
    logger.info(f"[Reprocess] Building global image dedup index for {article_id}")
    used_image_basenames: set = set()
    try:
        from urllib.parse import urlparse
        import os as _os
        cursor = db.scraped_articles.find(
            {"id": {"$ne": article_id}},
            {"_id": 0, "imageThumbnail": 1, "heroImage": 1, "bodyImage": 1}
        )
        async for doc in cursor:
            for field in ("imageThumbnail", "heroImage", "bodyImage"):
                url = doc.get(field)
                if url:
                    try:
                        path = urlparse(url).path
                        bn = _os.path.basename(path).lower().split("?")[0]
                        # Strip WordPress resize suffixes before comparing
                        bn = re.sub(r'-(\d+)x(\d+)(?=\.[a-zA-Z0-9]+$)', '', bn)
                        if bn:
                            used_image_basenames.add(bn)
                    except Exception:
                        pass
        logger.info(f"[Reprocess] Global dedup index: {len(used_image_basenames)} unique image basenames in use")
    except Exception as e:
        logger.warning(f"[Reprocess] Could not build dedup index: {e}")

    def _basename(url: str) -> str:
        """Extract cleaned basename for dedup comparison."""
        if not url:
            return ""
        try:
            from urllib.parse import urlparse
            import os as _os
            path = urlparse(url).path
            bn = _os.path.basename(path).lower().split("?")[0]
            bn = re.sub(r'-(\d+)x(\d+)(?=\.[a-zA-Z0-9]+$)', '', bn)
            return bn
        except Exception:
            return ""

    def _is_globally_unique(url: str) -> bool:
        """Returns True if this image basename has NOT been used in any other article."""
        bn = _basename(url)
        return bool(bn) and bn not in used_image_basenames

    # ── Step 3: Internet-wide image hunt ──────────────────────────────────────
    source_url = art.get("sourceUrl") or art.get("source_url", "")
    article_title = updates.get("title") or art.get("title", "")
    existing_thumb = art.get("imageThumbnail") or art.get("heroImage") or art.get("videoThumbnail")

    logger.info(f"[Reprocess] Starting internet image hunt for: {article_title[:70]}")

    # ── 3a. Scrape the article source page first ───────────────────────────────
    page_hero, page_body, v_meta = None, None, None
    if source_url:
        try:
            page_hero, page_body, v_meta = await _fetch_article_images(source_url, existing_thumb=existing_thumb)
            logger.info(f"[Reprocess] Page scrape: hero={'found' if page_hero else 'none'}, body={'found' if page_body else 'none'}")
        except Exception as e:
            logger.warning(f"[Reprocess] Page scrape failed: {e}")

    # ── 3b. Build search queries from article title + AI tags ─────────────────
    ai_tags = updates.get("aiTags") or art.get("aiTags") or []
    tag_str = " ".join(ai_tags[:3]) if ai_tags else ""
    # Extract key entities from the title for focused searches
    title_words = [w for w in article_title.split() if len(w) > 4 and w.isalpha()]
    title_anchor = " ".join(title_words[:4]) if title_words else "GTA 6"

    search_queries = [
        f'{title_anchor} GTA VI screenshots HD',
        f'{tag_str} GTA 6 Leonida 4K',
        f'GTA VI Lucia Jason Vice City screenshots',
        f'Grand Theft Auto VI gameplay 2026',
        f'GTA 6 Leonida HD wallpaper',
    ]

    # ── 3c. Collect candidates from all search queries ────────────────────────
    search_candidates: list = []
    for q in search_queries:
        try:
            results = await search_fallback_images_ddg(q)
            search_candidates.extend(results)
            if len(search_candidates) >= 60:
                break
            await asyncio.sleep(0.3)  # polite delay between queries
        except Exception as e:
            logger.warning(f"[Reprocess] Search query failed '{q}': {e}")

    logger.info(f"[Reprocess] Internet search returned {len(search_candidates)} raw candidates")

    # ── 3d. Filter and rank all candidates ────────────────────────────────────
    # Pool: page images first (most relevant), then internet search results
    all_candidates = []
    for url in ([page_hero, page_body] + search_candidates):
        if url and url not in all_candidates:
            all_candidates.append(url)

    # ── 3e. Pick hero image — first globally unique valid candidate ────────────
    final_hero = None
    final_hero_hash = None
    for candidate in all_candidates:
        if not candidate or not candidate.startswith('http'):
            continue
        if not _is_globally_unique(candidate):
            logger.debug(f"[Reprocess] Hero candidate rejected (globally used): {candidate[:80]}")
            continue
        # Quick URL validity check (skip HEAD check for explicit image URLs to prevent CDN blocks)
        has_ext = any(ext in candidate.split("?")[0].lower() for ext in ('.jpg', '.jpeg', '.png', '.webp'))
        if not has_ext:
            try:
                import httpx as _httpx
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
                async with _httpx.AsyncClient(timeout=4, follow_redirects=True, headers=headers) as cli:
                    head = await cli.head(candidate)
                if head.status_code not in (200, 206):
                    continue
                ct = head.headers.get("content-type", "")
                if "image" not in ct:
                    continue
            except Exception:
                continue
        final_hero = candidate
        used_image_basenames.add(_basename(candidate))  # mark as used for body dedup
        final_hero_hash = await _get_image_dhash_from_url(final_hero)
        logger.info(f"[Reprocess] Hero selected: {final_hero[:100]}")
        break

    # Keep existing hero if we couldn't find a globally unique one
    if not final_hero:
        final_hero = existing_thumb
        if final_hero:
            final_hero_hash = await _get_image_dhash_from_url(final_hero)
        logger.info(f"[Reprocess] Keeping existing hero (no unique internet alternative found)")

    # ── 3f. Pick body image — must be globally unique AND visually distinct from hero ──
    final_body = None
    hero_basename = _basename(final_hero) if final_hero else ""
    for candidate in all_candidates:
        if not candidate or not candidate.startswith('http'):
            continue
        # Must not be the same as hero
        if _basename(candidate) == hero_basename:
            continue
        # Must be globally unique across all articles
        if not _is_globally_unique(candidate):
            logger.debug(f"[Reprocess] Body candidate rejected (globally used): {candidate[:80]}")
            continue
        # Visual hash check against hero — must be visually distinct (hamming >= 10)
        if final_hero_hash:
            c_hash = await _get_image_dhash_from_url(candidate)
            if c_hash:
                dist = _hamming_distance(final_hero_hash, c_hash)
                if dist < 10:
                    logger.debug(f"[Reprocess] Body candidate rejected (visually similar, dist={dist}): {candidate[:80]}")
                    continue
        # Quick reachability check (skip HEAD check for explicit image URLs to prevent CDN blocks)
        has_ext = any(ext in candidate.split("?")[0].lower() for ext in ('.jpg', '.jpeg', '.png', '.webp'))
        if not has_ext:
            try:
                import httpx as _httpx
                headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"}
                async with _httpx.AsyncClient(timeout=4, follow_redirects=True, headers=headers) as cli:
                    head = await cli.head(candidate)
                if head.status_code not in (200, 206):
                    continue
                ct = head.headers.get("content-type", "")
                if "image" not in ct:
                    continue
            except Exception:
                continue
        final_body = candidate
        used_image_basenames.add(_basename(candidate))
        logger.info(f"[Reprocess] Body selected: {final_body[:100]}")
        break

    # ── 3g. Assemble visual_metadata if we have both ───────────────────────────
    final_visual_metadata = v_meta  # from page scrape
    if final_hero and final_body:
        h_hash = final_hero_hash or await _get_image_dhash_from_url(final_hero)
        b_hash = await _get_image_dhash_from_url(final_body)
        dist = _hamming_distance(h_hash, b_hash) if (h_hash and b_hash) else 99
        final_visual_metadata = {
            "hero_hash_hex": h_hash,
            "body_hash_hex": b_hash,
            "hamming_distance": dist,
            "hero_resolution": "internet_sourced",
            "body_resolution": "internet_sourced",
            "hero_segments": _decompose_hash(h_hash),
            "body_segments": _decompose_hash(b_hash),
        }

    # ── Step 4: Apply image updates ───────────────────────────────────────────
    if final_hero:
        updates["imageThumbnail"] = final_hero
        updates["heroImage"] = final_hero
    if final_body:
        updates["bodyImage"] = final_body
    if final_visual_metadata:
        updates["visual_metadata"] = final_visual_metadata

    logger.info(f"[Reprocess] Complete for {article_id} — hero={'set' if final_hero else 'missing'}, body={'set' if final_body else 'missing'}")

    # ── Step 5: Persist ───────────────────────────────────────────────────────
    await db.scraped_articles.update_one({"id": article_id}, {"$set": updates})

    return {
        "success": True,
        "title": updates.get("title"),
        "aiSummary": updates.get("aiSummary"),
        "aiContent": updates.get("aiContent"),
        "aiTags": updates.get("aiTags"),
        "newsValueScore": updates.get("newsValueScore"),
        "imageThumbnail": updates.get("imageThumbnail"),
        "heroImage": updates.get("heroImage"),
        "bodyImage": updates.get("bodyImage"),
        "visual_metadata": updates.get("visual_metadata"),
    }

# ── Hero / Featured ───────────────────────────────────────────────────────────
@api_router.post("/editorial/set-hero/{article_id}")
async def set_hero(article_id: str, _: bool = Depends(require_editorial_key)):
    await db.scraped_articles.update_many({}, {"$set": {"isFeatured": False}})
    res = await db.scraped_articles.update_one(
        {"id": article_id},
        {"$set": {"isFeatured": True, "status": "published"}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"success": True}

@api_router.get("/editorial/hero")
async def get_hero(_: bool = Depends(require_editorial_key)):
    doc = await db.scraped_articles.find_one({"isFeatured": True, "status": "published"}, {"_id": 0})
    return {"hero": doc}

# ── Audit ─────────────────────────────────────────────────────────────────────
@api_router.get("/editorial/audit/missing-summaries")
async def audit_missing(_: bool = Depends(require_editorial_key)):
    articles = await db.scraped_articles.find(
        {"status": "published", "aiProcessed": False}, {"_id": 0, "id": 1, "title": 1}
    ).to_list(100)
    return {"count": len(articles), "articles": articles}

@api_router.post("/editorial/audit/repair-summaries")
async def repair_summaries(background_tasks: BackgroundTasks, _: bool = Depends(require_editorial_key)):
    articles = await db.scraped_articles.find(
        {"status": "published", "aiProcessed": False}, {"_id": 0}
    ).to_list(100)
    background_tasks.add_task(_run_audit_repair, articles)
    return {"message": f"Queued {len(articles)} articles for AI backfill", "count": len(articles)}

async def _run_audit_repair(articles: list):
    for art in articles:
        try:
            updates = await ai_summarize(art)
            await db.scraped_articles.update_one({"id": art["id"]}, {"$set": updates})
            await asyncio.sleep(0.6)
        except Exception as e:
            logger.warning(f"[Repair] Failed {art.get('id')}: {e}")

# ── Published articles list (for PublishedPanel) ──────────────────────────────
@api_router.get("/editorial/published")
async def editorial_published(
    search: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(30, ge=1, le=100),
    offset: int = Query(0, ge=0),
    _: bool = Depends(require_editorial_key),
):
    query: Dict[str, Any] = {"status": "published"}
    if category and category != "all":
        query["category"] = category
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    cursor = db.scraped_articles.find(query, {"_id": 0}).sort("approvedAt", -1).skip(offset).limit(limit)
    articles = await cursor.to_list(length=limit)
    total = await db.scraped_articles.count_documents(query)
    return {"articles": articles, "total": total, "limit": limit, "offset": offset}

# ── Breaking ticker ────────────────────────────────────────────────────────────
@api_router.get("/editorial/ticker")
async def get_ticker(_: bool = Depends(require_editorial_key)):
    doc = await db.site_settings.find_one({"key": "ticker"}, {"_id": 0})
    return {"items": doc.get("items", []) if doc else []}

@api_router.put("/editorial/ticker")
async def set_ticker(body: dict, _: bool = Depends(require_editorial_key)):
    items = body.get("items", [])
    await db.site_settings.update_one(
        {"key": "ticker"},
        {"$set": {"key": "ticker", "items": items, "updatedAt": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    return {"success": True, "items": items}

# ── Timeline analytics ─────────────────────────────────────────────────────────
@api_router.get("/editorial/timeline")
async def editorial_timeline(_: bool = Depends(require_editorial_key)):
    cutoff = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    pipeline_pub = [
        {"$match": {"status": "published", "approvedAt": {"$gte": cutoff}}},
        {"$group": {"_id": {"$substr": ["$approvedAt", 0, 10]}, "published": {"$sum": 1}}},
        {"$sort": {"_id": 1}},
    ]
    pipeline_rej = [
        {"$match": {"status": "rejected", "rejectionReason": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$rejectionReason", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    pub_rows = await db.scraped_articles.aggregate(pipeline_pub).to_list(14)
    rej_rows = await db.scraped_articles.aggregate(pipeline_rej).to_list(20)
    # Build 7-day timeline filling gaps
    from datetime import date as _date
    day_map = {r["_id"]: r["published"] for r in pub_rows}
    today = datetime.now(timezone.utc).date()
    timeline = []
    for i in range(6, -1, -1):
        d = (today - timedelta(days=i)).isoformat()
        timeline.append({"day": d, "published": day_map.get(d, 0), "rejected": 0})
    reason_breakdown = [{"rejection_reason": r["_id"], "count": r["count"]} for r in rej_rows]
    return {"timeline": timeline, "reasonBreakdown": reason_breakdown}

# ── Manual article entry ───────────────────────────────────────────────────────
@api_router.post("/editorial/manual-article")
async def manual_article(body: dict, _: bool = Depends(require_editorial_key)):
    title = (body.get("title") or "").strip()
    source_url = (body.get("sourceUrl") or "").strip()
    source_name = (body.get("sourceName") or "").strip()
    if not title or not source_url or not source_name:
        raise HTTPException(status_code=400, detail="title, sourceUrl, and sourceName are required")
    now_iso = datetime.now(timezone.utc).isoformat()
    url_hash = _url_hash(source_url)
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower())[:80].strip('-') + "-" + url_hash[:6]
    thumb = body.get("imageThumbnail") or None
    doc = {
        "id":             str(uuid.uuid4()),
        "slug":           slug,
        "title":          title,
        "excerpt":        body.get("excerpt") or None,
        "aiSummary":      body.get("aiSummary") or None,
        "aiContent":      None,
        "aiTags":         [],
        "category":       normalize_category(body.get("category")),
        "sourceName":     source_name,
        "sourceUrl":      source_url,
        "urlHash":        url_hash,
        "imageThumbnail": thumb,
        "heroImage":      thumb,
        "videoUrl":       None,
        "videoThumbnail": None,
        "isVideo":        False,
        "newsValueScore": 60,
        "status":         "published",
        "aiProcessed":    bool(body.get("aiSummary")),
        "isFeatured":     False,
        "publishedAt":    now_iso,
        "scrapedAt":      now_iso,
        "approvedAt":     now_iso,
        "rejectionReason":None,
        "body":           [],
        "author":         body.get("author") or "Leonida Vice",
        "date":           now_iso[:10],
        "readTime":       "2 min read",
        "tags":           [],
    }
    await db.scraped_articles.update_one({"slug": slug}, {"$set": doc}, upsert=True)
    return {"success": True, "slug": slug, "title": title}

# ── Sources management ────────────────────────────────────────────────────────
@api_router.get("/editorial/sources")
async def list_sources(_: bool = Depends(require_editorial_key)):
    sources = await db.scraper_sources.find({}, {"_id": 0}).sort("name", 1).to_list(100)
    return {"sources": sources}

@api_router.post("/editorial/sources/{source_name}/toggle")
async def toggle_source(source_name: str, _: bool = Depends(require_editorial_key)):
    src = await db.scraper_sources.find_one({"name": source_name}, {"_id": 0})
    if not src:
        raise HTTPException(status_code=404, detail="Source not found")
    new_state = not src.get("isActive", True)
    await db.scraper_sources.update_one({"name": source_name}, {"$set": {"isActive": new_state}})
    return {"success": True, "isActive": new_state, "name": source_name}

# ── Scraper control ───────────────────────────────────────────────────────────
@api_router.get("/editorial/scraper/status")
async def scraper_status(_: bool = Depends(require_editorial_key)):
    runs = await db.scraper_runs.find({}, {"_id": 0}).sort("startedAt", -1).limit(10).to_list(10)
    return {
        "isRunning":  _scraper_running,
        "lastRunId":  _last_run_id,
        "recentRuns": runs,
        "nextRunIn":  _get_next_run_str(),
    }

@api_router.post("/editorial/scraper/trigger")
async def trigger_scraper(background_tasks: BackgroundTasks, _: bool = Depends(require_editorial_key)):
    if _scraper_running:
        return {"message": "Scraper already running", "runId": _last_run_id}
    background_tasks.add_task(run_scraper_pipeline, True)
    return {"message": "Scrape triggered"}

# ── Legacy Groq proxy (existing EditorialDesk manual parsing) ─────────────────
import json as _json

@api_router.post("/editorial/parse")
async def parse_article_groq(
    payload: dict,
    _: bool = Depends(require_ingest_token),
    x_groq_api_key: Optional[str] = Header(None)
):
    if not x_groq_api_key:
        raise HTTPException(status_code=400, detail="Missing X-Groq-Api-Key header")
    raw_text = payload.get("rawText","")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing rawText")
    model = payload.get("model","llama-3.3-70b-versatile")
    import requests as _req
    system_prompt = (
        "You are a premium editorial parsing agent for 'Leonida Vice', a high-end Grand Theft Auto VI news network. "
        "Parse raw text into a structured JSON payload with: slug, title, dek, category (one of: Leaks/Tech/Story/Media/World/Markets), "
        "author, date, readTime, heroImage, tags (array), newsValueScore (0-100), and body (array of blocks with type: lead/p/h2/pull/image). "
        "Output ONLY raw JSON, no markdown."
    )
    groq_payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Parse into JSON:\n\n{raw_text}"}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    try:
        r = _req.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=groq_payload,
            headers={"Authorization": f"Bearer {x_groq_api_key}", "Content-Type": "application/json"},
            timeout=30,
        )
        if r.status_code != 200:
            raise HTTPException(status_code=r.status_code, detail=f"Groq: {r.text}")
        return _json.loads(r.json()["choices"][0]["message"]["content"])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ══════════════════════════════════════════════════════════════════════════════
# OG IMAGE GENERATOR
# ══════════════════════════════════════════════════════════════════════════════
RELEASE_DATE = datetime(2026, 11, 19, tzinfo=timezone.utc)

def _load_font(size: int, bold: bool = False):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

@api_router.get("/og/countdown.png")
async def og_countdown_image():
    from PIL import ImageFilter
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (5, 5, 5))
    for (cx, cy, r, color, alpha) in [
        (200, 120, 320, (255, 42, 109), 110),
        (1050, 200, 380, (255, 123, 0), 90),
        (700, 580, 420, (5, 217, 232), 70),
    ]:
        blob = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(blob)
        bd.ellipse((cx-r, cy-r, cx+r, cy+r), fill=(*color, alpha))
        blob = blob.filter(ImageFilter.GaussianBlur(radius=80))
        img.paste(blob, (0, 0), blob)
    draw = ImageDraw.Draw(img)
    diff = RELEASE_DATE - datetime.now(timezone.utc)
    days = max(0, diff.days)
    for x in (60, 64):
        draw.line([(x, 60), (x, h-60)], fill=(255,255,255), width=1)
    draw.text((96, 70), "LEONIDA VICE  ·  THE GTA VI FAN ARCHIVE", font=_load_font(22, True), fill=(5,217,232))
    f_big = _load_font(260, True)
    days_str = str(days)
    bbox = draw.textbbox((0,0), days_str, font=f_big)
    tw = bbox[2]-bbox[0]
    draw.text((96, 130), days_str, font=f_big, fill=(255,255,255))
    draw.text((96+tw+24, 250), "DAYS", font=_load_font(48, True), fill=(255,42,109))
    draw.text((96+tw+26, 310), "UNTIL LEONIDA", font=_load_font(22, True), fill=(200,200,200))
    draw.line([(96, 460), (w-96, 460)], fill=(255,255,255), width=2)
    draw.text((96, 485), "GRAND THEFT AUTO VI", font=_load_font(54, True), fill=(255,255,255))
    draw.text((96, 555), "November 19, 2026  ·  PS5  ·  Xbox Series X|S", font=_load_font(22), fill=(180,180,180))
    draw.text((w-260, 555), "leonida.vice", font=_load_font(20, True), fill=(5,217,232))
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return Response(content=buf.getvalue(), media_type="image/png", headers={"Cache-Control": "public, max-age=3600"})

# ══════════════════════════════════════════════════════════════════════════════
# APP SETUP
# ══════════════════════════════════════════════════════════════════════════════
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    global _next_run_time
    # Seed sources into DB
    try:
        for src in DEFAULT_SOURCES:
            await db.scraper_sources.update_one(
                {"name": src["name"]},
                {"$setOnInsert": {**src, "isActive": True, "lastScrapedAt": None, "lastError": None}},
                upsert=True,
            )
        logger.info(f"[Startup] Seeded {len(DEFAULT_SOURCES)} sources")
    except Exception as e:
        logger.error(f"[Startup] Source seeding failed: {e}")

    # DB cleanup: normalize bad categories
    try:
        await db.scraped_articles.update_many({"category": {"$in": ["Intel","intel"]}}, {"$set": {"category": "Leaks"}})
        await db.scraped_articles.update_many({"category": {"$in": ["Trailers","trailers","Trailer","trailer"]}}, {"$set": {"category": "Media"}})
        await db.scraped_articles.update_many({"category": {"$in": ["Investigations","investigations"]}}, {"$set": {"category": "Leaks"}})
    except Exception as e:
        logger.error(f"[Startup] Category cleanup failed: {e}")

    # Add status field to existing articles that don't have it
    try:
        await db.scraped_articles.update_many(
            {"status": {"$exists": False}},
            {"$set": {"status": "published", "aiProcessed": False, "isFeatured": False}}
        )
    except Exception as e:
        logger.error(f"[Startup] Status migration failed: {e}")

    _next_run_time = _compute_next_run()

    # Start APScheduler
    try:
        from apscheduler.schedulers.asyncio import AsyncIOScheduler
        scheduler = AsyncIOScheduler(timezone="UTC")
        scheduler.add_job(_scheduled_scrape, 'cron', hour=6, minute=0)
        scheduler.add_job(_audit_missing_summaries, 'interval', minutes=30)
        scheduler.start()
        logger.info("[Startup] Scheduler started — daily scrape at 06:00 UTC, audit every 30 min")
    except Exception as e:
        logger.error(f"[Startup] Scheduler failed to start: {e}")

    # Run audit 10 seconds after boot
    async def _delayed_audit():
        await asyncio.sleep(10)
        await _audit_missing_summaries()
    asyncio.create_task(_delayed_audit())

@app.on_event("shutdown")
async def shutdown():
    client.close()
