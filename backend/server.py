from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Query
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

INGEST_TOKEN = os.environ.get('INGEST_TOKEN', '')

# Create the main app without a prefix
app = FastAPI(title="Leonida Vice API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ── Existing status models ──
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


import json

# ── Scraped article models (match the scraper's article schema) ──
class ScrapedArticle(BaseModel):
    """Schema mirrors the api-server / scraper output."""
    model_config = ConfigDict(extra="allow")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    slug: str
    title: str
    excerpt: Optional[str] = None
    aiSummary: Optional[str] = None
    category: Optional[str] = None
    sourceName: Optional[str] = None
    sourceUrl: Optional[str] = None
    url: Optional[str] = None
    imageThumbnail: Optional[str] = None
    videoThumbnail: Optional[str] = None
    isVideo: bool = False
    newsValueScore: int = 50
    commentsCount: int = 0
    publishedAt: Optional[str] = None  # ISO string
    scrapedAt: Optional[str] = None    # ISO string
    
    # Rich editorial fields added for the Editorial Desk CMS
    author: Optional[str] = None
    date: Optional[str] = None
    readTime: Optional[str] = None
    heroImage: Optional[str] = None
    tags: Optional[List[str]] = None
    body: Optional[List[dict]] = None


class IngestPayload(BaseModel):
    articles: List[ScrapedArticle]


# ── Auth dependency ──
def require_ingest_token(authorization: Optional[str] = Header(None)):
    if not INGEST_TOKEN:
        raise HTTPException(status_code=500, detail="Server ingest token not configured")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    if authorization.split(" ", 1)[1].strip() != INGEST_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid ingest token")
    return True


# ── Existing routes ──
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    rows = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for r in rows:
        if isinstance(r.get('timestamp'), str):
            r['timestamp'] = datetime.fromisoformat(r['timestamp'])
    return rows


# ── Scraped articles ingest + read ──
@api_router.post("/articles/ingest")
async def ingest_articles(payload: IngestPayload, _: bool = Depends(require_ingest_token)):
    """Upsert scraped articles. Idempotent by slug."""
    now_iso = datetime.now(timezone.utc).isoformat()
    upserted = 0
    for art in payload.articles:
        doc = art.model_dump()
        if not doc.get('scrapedAt'):
            doc['scrapedAt'] = now_iso
        await db.scraped_articles.update_one(
            {"slug": doc['slug']},
            {"$set": doc},
            upsert=True,
        )
        upserted += 1
    return {"upserted": upserted, "received": len(payload.articles)}


@api_router.get("/articles")
async def list_articles(
    category: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Paginated newswire feed sorted by publishedAt desc."""
    query = {}
    if category:
        query['category'] = category
    cursor = db.scraped_articles.find(query, {"_id": 0}).sort("publishedAt", -1).skip(offset).limit(limit)
    items = await cursor.to_list(length=limit)
    total = await db.scraped_articles.count_documents(query)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@api_router.get("/articles/trending")
async def trending_articles(limit: int = Query(10, ge=1, le=50)):
    """Top items by newsValueScore from the last 48 hours."""
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=48)).isoformat()
    cursor = db.scraped_articles.find(
        {"publishedAt": {"$gte": cutoff}},
        {"_id": 0},
    ).sort("newsValueScore", -1).limit(limit)
    items = await cursor.to_list(length=limit)
    # Fallback: if nothing in the last 48h, return top scored overall
    if not items:
        cursor = db.scraped_articles.find({}, {"_id": 0}).sort("newsValueScore", -1).limit(limit)
        items = await cursor.to_list(length=limit)
    return {"items": items}


@api_router.get("/articles/{slug}")
async def get_article(slug: str):
    doc = await db.scraped_articles.find_one({"slug": slug}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Article not found")
    return doc


@api_router.delete("/articles/{slug}")
async def delete_article(slug: str, _: bool = Depends(require_ingest_token)):
    """Delete an ingested article from MongoDB."""
    res = await db.scraped_articles.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Article not found")
    return {"message": "Article deleted successfully"}


@api_router.post("/editorial/parse")
async def parse_article(
    payload: dict,
    _: bool = Depends(require_ingest_token),
    x_groq_api_key: Optional[str] = Header(None)
):
    """Proxy the raw text to Groq AI to parse it into structured editorial blocks."""
    if not x_groq_api_key:
        raise HTTPException(status_code=400, detail="Missing Groq API Key header (X-Groq-Api-Key)")
    
    raw_text = payload.get("rawText", "")
    if not raw_text:
        raise HTTPException(status_code=400, detail="Missing rawText in payload")
        
    model = payload.get("model", "llama3-70b-8192")
    
    headers = {
        "Authorization": f"Bearer {x_groq_api_key}",
        "Content-Type": "application/json"
    }
    
    system_prompt = (
        "You are a premium editorial parsing agent for 'Leonida Vice', a high-end Grand Theft Auto VI news and database network. "
        "Your task is to take any raw scraped article or newsletter text and transform it into a highly polished, structural JSON payload that matches our premium design requirements.\n\n"
        "Follow these strict layout and content rules:\n"
        "1. **Structure:** Your output must match the ScrapedArticle JSON format.\n"
        "2. **Category:** Must fit one of the following filters: 'Leaks', 'Tech', 'Story', 'Media', 'World', 'Markets'.\n"
        "3. **Hero Image:** Pick the most striking, cinematic, high-resolution landscape image URL related to the topic.\n"
        "4. **Editorial Body Blocks:** Translate the article's text into an array of blocks under the 'body' key. The block array must have these types:\n"
        "   - 'lead': The first paragraph of the article. Must start with a bold, epic opening statement. (The website will render this with a large drop-cap).\n"
        "   - 'p': Standard narrative paragraphs. Break up text into short, readable paragraphs (3-4 sentences max).\n"
        "   - 'h2': Section headings. Keep them short, aggressive, and in uppercase (e.g. 'RTGI ON BASE HARDWARE', 'THE 30 FPS CONVERSATION').\n"
        "   - 'pull': An epic pullquote or short quote from a developer or analyst. Highly stylistic. Keep it punchy.\n"
        "   - 'image': Exactly one high-quality, full-bleed middle landscape image breaking up the content halfway through the article. Must include a caption in uppercase that serves as an editorial call-out (e.g., 'VICE CITY RENDERED WITH RTGI — THE LIGHTING MODEL THAT FINALLY DOES PASTEL JUSTICE.').\n"
        "5. **Score:** Assign a 'newsValueScore' between 0 and 100. If the score is 70 or above, it will be flagged as 'HOT' on the live feeds.\n\n"
        "Output ONLY a raw JSON payload, no conversation, no markdown blocks. Conforming strictly to the schema of ScrapedArticle."
    )
    
    groq_payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Parse the following scraped text into structured JSON:\n\n{raw_text}"}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }
    
    try:
        import requests
        res = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json=groq_payload,
            headers=headers,
            timeout=30
        )
        if res.status_code != 200:
            raise HTTPException(status_code=res.status_code, detail=f"Groq API Error: {res.text}")
        
        result_json = res.json()
        message_content = result_json["choices"][0]["message"]["content"]
        return json.loads(message_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse article: {str(e)}")


# ── Open Graph countdown image ──
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
    """1200x630 Open Graph image with the live countdown."""
    from PIL import ImageFilter

    w, h = 1200, 630
    img = Image.new("RGB", (w, h), (5, 5, 5))

    # Soft color blobs (vice pink, sunset orange, cyan edge)
    for (cx, cy, r, color, alpha) in [
        (200, 120, 320, (255, 42, 109), 110),
        (1050, 200, 380, (255, 123, 0), 90),
        (700, 580, 420, (5, 217, 232), 70),
    ]:
        blob = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        bd = ImageDraw.Draw(blob)
        bd.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, alpha))
        blob = blob.filter(ImageFilter.GaussianBlur(radius=80))
        img.paste(blob, (0, 0), blob)

    draw = ImageDraw.Draw(img)

    diff = RELEASE_DATE - datetime.now(timezone.utc)
    days = max(0, diff.days)

    # Left hairlines
    for x in (60, 64):
        draw.line([(x, 60), (x, h - 60)], fill=(255, 255, 255), width=1)

    f_eyebrow = _load_font(22, bold=True)
    draw.text((96, 70), "LEONIDA VICE  ·  THE GTA VI FAN ARCHIVE", font=f_eyebrow, fill=(5, 217, 232))

    f_big = _load_font(260, bold=True)
    days_str = str(days)
    bbox = draw.textbbox((0, 0), days_str, font=f_big)
    tw = bbox[2] - bbox[0]
    draw.text((96, 130), days_str, font=f_big, fill=(255, 255, 255))

    f_label = _load_font(48, bold=True)
    draw.text((96 + tw + 24, 250), "DAYS", font=f_label, fill=(255, 42, 109))
    f_label_small = _load_font(22, bold=True)
    draw.text((96 + tw + 26, 310), "UNTIL LEONIDA", font=f_label_small, fill=(200, 200, 200))

    draw.line([(96, 460), (w - 96, 460)], fill=(255, 255, 255), width=2)

    f_head = _load_font(54, bold=True)
    draw.text((96, 485), "GRAND THEFT AUTO VI", font=f_head, fill=(255, 255, 255))

    f_foot = _load_font(22)
    draw.text((96, 555), "November 19, 2026  ·  PS5  ·  Xbox Series X|S", font=f_foot, fill=(180, 180, 180))

    f_badge = _load_font(20, bold=True)
    draw.text((w - 260, 555), "leonida.vice", font=f_badge, fill=(5, 217, 232))

    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return Response(
        content=buf.getvalue(),
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=3600"},
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
