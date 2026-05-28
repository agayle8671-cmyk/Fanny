#!/usr/bin/env python3
"""Seed the Newswire with realistic scraped articles for demo / dev."""
import os
import json
import urllib.request
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Read backend INGEST_TOKEN and frontend API URL
def read_env(path, key):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip('"').strip("'")
    raise SystemExit(f"{key} not found in {path}")

TOKEN = read_env(os.path.join(ROOT, "backend", ".env"), "INGEST_TOKEN")
# Use localhost when running inside the container to bypass Cloudflare WAF.
API = os.environ.get("API_URL", "http://localhost:8001")

now = datetime.now(timezone.utc)

def hours_ago(n):
    return (now - timedelta(hours=n)).isoformat()

ARTICLES = [
    {
        "slug": "ign-rockstar-q4-2026-locked",
        "title": "Rockstar reaffirms November 19, 2026 launch on Take-Two Q3 earnings call",
        "excerpt": "Strauss Zelnick called the date 'locked.' No PC window discussed.",
        "aiSummary": "Take-Two CEO confirmed Nov 19, 2026 PS5/Xbox launch. No PC date.",
        "category": "World", "sourceName": "IGN",
        "sourceUrl": "https://ign.com/articles/gta6-q4-locked",
        "url": "https://ign.com/articles/gta6-q4-locked",
        "imageThumbnail": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2400",
        "newsValueScore": 94, "commentsCount": 1842, "publishedAt": hours_ago(2),
    },
    {
        "slug": "reddit-split-screen-coop-strings",
        "title": "Datamine: SDK strings reference SPLIT_SCREEN_HEIST flag for Jason/Lucia",
        "excerpt": "Leaked console SDK strings discovered in a developer build hint at local co-op.",
        "aiSummary": "Console SDK leak surfaces strings suggesting split-screen co-op for select heists.",
        "category": "Leaks", "sourceName": "Reddit r/GTA6",
        "sourceUrl": "https://reddit.com/r/GTA6/comments/sdk-leak",
        "url": "https://reddit.com/r/GTA6/comments/sdk-leak",
        "imageThumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400",
        "newsValueScore": 81, "commentsCount": 4218, "publishedAt": hours_ago(5),
    },
    {
        "slug": "eurogamer-tequesta-tech-breakdown",
        "title": "Eurogamer: Tequesta's vertical chase is a generational tech showcase",
        "excerpt": "Frame-by-frame breakdown of the six-floor enterable skyscraper.",
        "aiSummary": "Detailed Digital Foundry-style analysis of Tequesta vertical traversal footage.",
        "category": "Tech", "sourceName": "Eurogamer",
        "sourceUrl": "https://eurogamer.net/gta6-tequesta-analysis",
        "url": "https://eurogamer.net/gta6-tequesta-analysis",
        "imageThumbnail": "https://images.unsplash.com/photo-1628027927481-a528c344ae7b?q=80&w=2400",
        "newsValueScore": 68, "commentsCount": 612, "publishedAt": hours_ago(9),
    },
    {
        "slug": "gamespot-soundtrack-tom-petty-licensing",
        "title": "GameSpot: How Rockstar locked down Tom Petty for Trailer 1",
        "excerpt": "Inside the rights deal that put 'Love Is a Long Road' on the franchise's biggest moment.",
        "aiSummary": "Licensing breakdown of the Tom Petty needle drop that opened Trailer 1.",
        "category": "Story", "sourceName": "GameSpot",
        "sourceUrl": "https://gamespot.com/gta6-tom-petty-deal",
        "url": "https://gamespot.com/gta6-tom-petty-deal",
        "imageThumbnail": "https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400",
        "newsValueScore": 62, "commentsCount": 287, "publishedAt": hours_ago(14),
    },
    {
        "slug": "vgc-shinyhunters-rockstar-78m-records",
        "title": "VGC: ShinyHunters dumps 78.6M Rockstar records after ransom deadline lapses",
        "excerpt": "GTA Online revenue figures, marketing decks, and DLC roadmap fragments included.",
        "aiSummary": "Hacker collective ShinyHunters released 78.6M records from a Rockstar third-party breach.",
        "category": "Leaks", "sourceName": "VGC",
        "sourceUrl": "https://videogameschronicle.com/gta6-shinyhunters-dump",
        "url": "https://videogameschronicle.com/gta6-shinyhunters-dump",
        "imageThumbnail": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=2400",
        "newsValueScore": 96, "commentsCount": 5821, "publishedAt": hours_ago(18),
    },
    {
        "slug": "pcgamer-no-pc-window-2027",
        "title": "PC Gamer: Industry analysts now expect a 2027 PC port at the earliest",
        "excerpt": "Take-Two's silence on PC mirrors the GTA V playbook — and points to a one-year exclusivity window.",
        "aiSummary": "Analysts model a Q3-Q4 2027 PC release based on the GTA V launch cadence.",
        "category": "World", "sourceName": "PC Gamer",
        "sourceUrl": "https://pcgamer.com/gta6-pc-window-2027",
        "url": "https://pcgamer.com/gta6-pc-window-2027",
        "imageThumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400",
        "newsValueScore": 71, "commentsCount": 1932, "publishedAt": hours_ago(21),
    },
    {
        "slug": "gamesradar-relationship-bar-deep-dive",
        "title": "GamesRadar: How the Relationship Bar reshapes mission design",
        "excerpt": "Trust between Lucia and Jason is now a system-level variable — and it can fail you.",
        "aiSummary": "Long-read on the Relationship Bar mechanic and its impact on branching mission outcomes.",
        "category": "Story", "sourceName": "GamesRadar",
        "sourceUrl": "https://gamesradar.com/gta6-relationship-bar",
        "url": "https://gamesradar.com/gta6-relationship-bar",
        "imageThumbnail": "https://images.unsplash.com/photo-1582987144051-9031c6a85290?q=80&w=2400",
        "newsValueScore": 73, "commentsCount": 921, "publishedAt": hours_ago(26),
    },
    {
        "slug": "dexerto-bawsaq-tequesta-trading-floor",
        "title": "Dexerto spots a working BAWSAQ trading floor in Trailer 2 footage",
        "excerpt": "Frame 0:42 shows AUGURY, VAPID, and BAWSAQ tickers running across a chyron.",
        "aiSummary": "Trailer 2 includes a brief shot of a working BAWSAQ floor inside Tequesta.",
        "category": "Markets", "sourceName": "Dexerto",
        "sourceUrl": "https://dexerto.com/gta6-bawsaq-trading-floor",
        "url": "https://dexerto.com/gta6-bawsaq-trading-floor",
        "imageThumbnail": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2400",
        "newsValueScore": 64, "commentsCount": 412, "publishedAt": hours_ago(30),
    },
    {
        "slug": "rockstar-newswire-second-trailer-views",
        "title": "Rockstar Newswire: Trailer 2 crosses 800M views in 9 weeks",
        "excerpt": "The fastest trailer of all time on YouTube, by a sizable margin.",
        "aiSummary": "Trailer 2 has surpassed 800 million YouTube views since its May 2025 release.",
        "category": "Trailers", "sourceName": "Rockstar Newswire",
        "sourceUrl": "https://rockstargames.com/newswire/gta6-t2-800m",
        "url": "https://rockstargames.com/newswire/gta6-t2-800m",
        "imageThumbnail": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400",
        "newsValueScore": 85, "commentsCount": 3104, "publishedAt": hours_ago(36),
    },
    {
        "slug": "pushsquare-ps5-pro-performance-mode",
        "title": "Push Square: PS5 Pro performance mode reportedly tested at 40fps",
        "excerpt": "Pro-only mode discovered in Rockstar's internal QA build, not committed to public.",
        "aiSummary": "Internal QA suggests a 40fps PS5 Pro mode is being tested but not publicly confirmed.",
        "category": "Tech", "sourceName": "Push Square",
        "sourceUrl": "https://pushsquare.com/gta6-ps5-pro-40fps",
        "url": "https://pushsquare.com/gta6-ps5-pro-40fps",
        "imageThumbnail": "https://images.unsplash.com/photo-1628027927481-a528c344ae7b?q=80&w=2400",
        "newsValueScore": 76, "commentsCount": 1241, "publishedAt": hours_ago(42),
    },
    {
        "slug": "ign-mount-kalaga-mystery-theories",
        "title": "IGN: Inside the early Mount Kalaga mystery theory-crafting",
        "excerpt": "Fans are already mapping caves, antennas, and ridgelines in Trailer 2 footage.",
        "aiSummary": "Mount Kalaga National Park is shaping up to host GTA 6's Chiliad-style mythology.",
        "category": "World", "sourceName": "IGN",
        "sourceUrl": "https://ign.com/articles/gta6-mount-kalaga-mystery",
        "url": "https://ign.com/articles/gta6-mount-kalaga-mystery",
        "imageThumbnail": "https://images.unsplash.com/photo-1629934844513-df3e988a0157?q=80&w=2400",
        "newsValueScore": 67, "commentsCount": 524, "publishedAt": hours_ago(50),
    },
    {
        "slug": "reddit-cal-hampton-houseboat-interior",
        "title": "Reddit: First clear look at Cal Hampton's houseboat interior",
        "excerpt": "Scanner stack, corkboard of conspiracies, and a CRT-era police monitor.",
        "aiSummary": "New Trailer 2 frame analysis reveals the interior of Cal Hampton's houseboat.",
        "category": "Story", "sourceName": "Reddit r/GTA6",
        "sourceUrl": "https://reddit.com/r/GTA6/comments/cal-houseboat",
        "url": "https://reddit.com/r/GTA6/comments/cal-houseboat",
        "imageThumbnail": "https://images.unsplash.com/photo-1611601147557-cdc89476ec4a?q=80&w=2400",
        "newsValueScore": 58, "commentsCount": 882, "publishedAt": hours_ago(58),
    },
    {
        "slug": "vgc-collectors-edition-leaked-listing",
        "title": "VGC: Collector's Edition listing surfaces on European retailer site",
        "excerpt": "Steelbook, cloth map of Leonida, vinyl OST, in-game cosmetics — and a $249 price tag.",
        "aiSummary": "Leaked retailer listing surfaces Collector's Edition contents including a cloth map.",
        "category": "Leaks", "sourceName": "VGC",
        "sourceUrl": "https://videogameschronicle.com/gta6-collectors-edition-leak",
        "url": "https://videogameschronicle.com/gta6-collectors-edition-leak",
        "imageThumbnail": "https://images.unsplash.com/photo-1666032800277-607511d3869a?q=80&w=2400",
        "newsValueScore": 88, "commentsCount": 2918, "publishedAt": hours_ago(64),
    },
    {
        "slug": "gamespot-trailer-3-prediction-window",
        "title": "GameSpot: Trailer 3 prediction windows narrow to mid-2026",
        "excerpt": "Tracking the historical cadence between Rockstar trailers.",
        "aiSummary": "Cadence analysis predicts Trailer 3 will drop sometime between May and August 2026.",
        "category": "Trailers", "sourceName": "GameSpot",
        "sourceUrl": "https://gamespot.com/gta6-trailer-3-window",
        "url": "https://gamespot.com/gta6-trailer-3-window",
        "imageThumbnail": "https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400",
        "newsValueScore": 60, "commentsCount": 421, "publishedAt": hours_ago(72),
    },
    {
        "slug": "eurogamer-rage-engine-hair-strand-deep",
        "title": "Eurogamer: The Hair Strand System is the silent star of the trailers",
        "excerpt": "Per-strand simulation isn't just for Lucia — it's a system-wide pipeline.",
        "aiSummary": "Deep dive on RAGE Engine's hair-strand simulation and its environmental applications.",
        "category": "Tech", "sourceName": "Eurogamer",
        "sourceUrl": "https://eurogamer.net/gta6-hair-strand-system",
        "url": "https://eurogamer.net/gta6-hair-strand-system",
        "imageThumbnail": "https://images.unsplash.com/photo-1582987144051-9031c6a85290?q=80&w=2400",
        "newsValueScore": 65, "commentsCount": 318, "publishedAt": hours_ago(81),
    },
    {
        "slug": "pcgamer-bawsaq-social-signal-ingestion",
        "title": "PC Gamer: BAWSAQ will reportedly ingest real-world social signals",
        "excerpt": "A Twitter pile-on against a fictional brand will now move that brand's stock.",
        "aiSummary": "Documents suggest BAWSAQ will move on social-media sentiment in addition to in-game actions.",
        "category": "Markets", "sourceName": "PC Gamer",
        "sourceUrl": "https://pcgamer.com/gta6-bawsaq-social-signals",
        "url": "https://pcgamer.com/gta6-bawsaq-social-signals",
        "imageThumbnail": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2400",
        "newsValueScore": 79, "commentsCount": 1488, "publishedAt": hours_ago(90),
    },
    {
        "slug": "dexerto-vice-radio-station-list-confirms",
        "title": "Dexerto: Six radio stations confirmed via end-credit licensing data",
        "excerpt": "V-Rock, Calle Sur, Only Raw, Sundial, Static 99, and Trapica.",
        "aiSummary": "End-credit licensing data confirms six radio stations spanning rock to reggaetón.",
        "category": "Story", "sourceName": "Dexerto",
        "sourceUrl": "https://dexerto.com/gta6-radio-stations",
        "url": "https://dexerto.com/gta6-radio-stations",
        "imageThumbnail": "https://images.unsplash.com/photo-1629935635086-1855c8d125cc?q=80&w=2400",
        "newsValueScore": 72, "commentsCount": 762, "publishedAt": hours_ago(100),
    },
    {
        "slug": "ign-jason-deadeye-mechanic-confirmed",
        "title": "IGN: Jason's Dead-Eye-style ability officially named 'Marksman Focus'",
        "excerpt": "Slow-motion targeting tied to weak-spot detection. Refills on stealth kills.",
        "aiSummary": "Jason's signature slow-motion combat ability is now officially branded 'Marksman Focus.'",
        "category": "Story", "sourceName": "IGN",
        "sourceUrl": "https://ign.com/articles/gta6-marksman-focus",
        "url": "https://ign.com/articles/gta6-marksman-focus",
        "imageThumbnail": "https://images.unsplash.com/photo-1567609222024-2e2a07be60ed?q=80&w=2400",
        "newsValueScore": 74, "commentsCount": 1108, "publishedAt": hours_ago(110),
    },
    {
        "slug": "gamesradar-online-32-player-confirmed",
        "title": "GamesRadar: 32-player Online lobbies confirmed in support documentation",
        "excerpt": "A meaningful jump from GTA V's 30. Sourced from the ShinyHunters dump.",
        "aiSummary": "Internal support docs confirm a 32-player ceiling for GTA Online lobbies in GTA VI.",
        "category": "Markets", "sourceName": "GamesRadar",
        "sourceUrl": "https://gamesradar.com/gta6-online-32-players",
        "url": "https://gamesradar.com/gta6-online-32-players",
        "imageThumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400",
        "newsValueScore": 82, "commentsCount": 2247, "publishedAt": hours_ago(125),
    },
    {
        "slug": "vgc-rural-county-mission-tease",
        "title": "VGC: Two new Ambrosia County crop-duster missions teased in dev interview",
        "excerpt": "Pesticide runs, sugar-field arson, and a moonshine convoy — the rural arc has shape.",
        "aiSummary": "Rockstar developer interview teases three Ambrosia County mission types focused on rural crime.",
        "category": "Story", "sourceName": "VGC",
        "sourceUrl": "https://videogameschronicle.com/gta6-ambrosia-missions",
        "url": "https://videogameschronicle.com/gta6-ambrosia-missions",
        "imageThumbnail": "https://images.unsplash.com/photo-1629935389411-1bb0ae0d1ffe?q=80&w=2400",
        "newsValueScore": 69, "commentsCount": 598, "publishedAt": hours_ago(140),
    },
    {
        "slug": "pushsquare-pre-order-bonus-leaks",
        "title": "Push Square: Pre-order bonus skins discovered in store metadata",
        "excerpt": "Tropical Heat livery for the Buffalo STX, plus a cosmetic Hawk & Little 9F.",
        "aiSummary": "Store-metadata mining reveals pre-order cosmetic bonuses including a Buffalo STX livery.",
        "category": "Leaks", "sourceName": "Push Square",
        "sourceUrl": "https://pushsquare.com/gta6-preorder-skins",
        "url": "https://pushsquare.com/gta6-preorder-skins",
        "imageThumbnail": "https://images.unsplash.com/photo-1596639410348-8470f7fa9f84?q=80&w=2400",
        "newsValueScore": 77, "commentsCount": 1612, "publishedAt": hours_ago(158),
    },
    {
        "slug": "ign-grassrivers-wildlife-fidelity",
        "title": "IGN: Grassrivers wildlife fidelity is closer to Red Dead 2 than GTA V",
        "excerpt": "Alligator threat AI, python ambushes, and weather that changes mission shape.",
        "aiSummary": "Grassrivers wetland ecosystem appears to use Red Dead 2-level wildlife behavioral AI.",
        "category": "World", "sourceName": "IGN",
        "sourceUrl": "https://ign.com/articles/gta6-grassrivers-wildlife",
        "url": "https://ign.com/articles/gta6-grassrivers-wildlife",
        "imageThumbnail": "https://images.unsplash.com/photo-1582987144051-9031c6a85290?q=80&w=2400",
        "newsValueScore": 70, "commentsCount": 824, "publishedAt": hours_ago(172),
    },
    {
        "slug": "gamespot-trailer-3-music-rumors",
        "title": "GameSpot: Trailer 3 music rumors point to a Beach Boys cut",
        "excerpt": "Multiple sources hint at 'Wouldn't It Be Nice' as the next big needle drop.",
        "aiSummary": "Rumor mill consolidates around a Beach Boys track for the still-unannounced Trailer 3.",
        "category": "Trailers", "sourceName": "GameSpot",
        "sourceUrl": "https://gamespot.com/gta6-trailer-3-beach-boys",
        "url": "https://gamespot.com/gta6-trailer-3-beach-boys",
        "imageThumbnail": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400",
        "newsValueScore": 56, "commentsCount": 388, "publishedAt": hours_ago(190),
    },
    {
        "slug": "reddit-vice-beach-collins-ave-walkable",
        "title": "Reddit: Vice Beach Collins Ave is reportedly fully walkable end-to-end",
        "excerpt": "Confirmed via art-book details from the Standard Edition leak.",
        "aiSummary": "Standard Edition art book details suggest the entire Collins Ave strip is navigable on foot.",
        "category": "World", "sourceName": "Reddit r/GTA6",
        "sourceUrl": "https://reddit.com/r/GTA6/comments/collins-ave",
        "url": "https://reddit.com/r/GTA6/comments/collins-ave",
        "imageThumbnail": "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c?q=80&w=2400",
        "newsValueScore": 63, "commentsCount": 705, "publishedAt": hours_ago(212),
    },
    {
        "slug": "eurogamer-loading-time-benchmark-leak",
        "title": "Eurogamer: Internal QA benchmarks show 4-6s fast-travel loads on base PS5",
        "excerpt": "A dramatic improvement over GTA V's 30+ second loading screens on PS4.",
        "aiSummary": "Leaked QA benchmarks show 4-6 second fast-travel loading times on base PlayStation 5.",
        "category": "Tech", "sourceName": "Eurogamer",
        "sourceUrl": "https://eurogamer.net/gta6-loading-benchmark",
        "url": "https://eurogamer.net/gta6-loading-benchmark",
        "imageThumbnail": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400",
        "newsValueScore": 80, "commentsCount": 1497, "publishedAt": hours_ago(240),
    },
]

print(f"Seeding {len(ARTICLES)} articles to {API}/api/articles/ingest")
payload = json.dumps({"articles": ARTICLES}).encode("utf-8")
req = urllib.request.Request(
    f"{API}/api/articles/ingest",
    data=payload,
    headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}",
    },
    method="POST",
)
try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        print(f"Status: {resp.status}")
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(f"HTTPError: {e.code} {e.reason}")
    print(e.read().decode())
