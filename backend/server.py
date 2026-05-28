from fastapi import FastAPI, APIRouter, Depends, HTTPException, Header, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


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


# ── Scraped article models (match the scraper's article schema) ──
class ScrapedArticle(BaseModel):
    """Schema mirrors the api-server / scraper output."""
    model_config = ConfigDict(extra="ignore")

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
