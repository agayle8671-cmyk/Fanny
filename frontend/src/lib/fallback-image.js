/**
 * ARTICLE BODY IMAGE RULES (see ARTICLE_LAYOUT_RULES.md)
 * - Hero/header image = topic-precise (the article's own thumbnail)
 * - Body image = loosely GTA6-related. Any authentic GTA VI screenshot,
 *   artwork, or Florida/Vice City scene is acceptable here.
 *   The body image MUST NOT duplicate the hero image.
 *
 * Rule: ONE big GTA6 pool. No topic matching needed for body images.
 * The header does the topic work. The body just needs to feel like GTA6.
 */

// 40-image GTA6 pool: screenshots, character art, Vice City, Florida scenes
const GTA6_POOL = [
  // --- Official / character art ---
  "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/8f27bda64f64ebd6453620848c5ec42959dae5b3db7d13932e1b573769470f79.png",  // Lucia Caminos
  "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/18ea9848372b348f0168b03c23d7b02531d161f51b1f30a4a089c2374b0e293c.png",  // Jason Duval
  "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/6dccb50f1f97f2f4f27319ab01773127d24f381cb080704869c46c535155b382.png",  // Lucia + Jason getaway

  // --- Miami / Vice City / Florida atmosphere ---
  "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?q=80&w=2400&auto=format&fit=crop",  // palm beach sunset
  "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=2400&auto=format&fit=crop",  // tropical neon city
  "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=2400&auto=format&fit=crop",  // palm trees sunset Vice City
  "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400&auto=format&fit=crop",  // Miami neon strip
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2400&auto=format&fit=crop",  // Florida Keys water
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2400&auto=format&fit=crop",  // beach sunset duo
  "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c?q=80&w=2400&auto=format&fit=crop",  // vice city sunset drive
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=2400&auto=format&fit=crop",  // miami art deco night
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2400&auto=format&fit=crop",  // coastal highway sunset

  // --- Urban crime / dark city / heist energy ---
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2400&auto=format&fit=crop",  // dark city alley
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2400&auto=format&fit=crop",  // noir skyline
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2400&auto=format&fit=crop",  // city lights night
  "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?q=80&w=2400&auto=format&fit=crop",  // rain-slicked highway night
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2400&auto=format&fit=crop",  // urban night glow
  "https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=2400&auto=format&fit=crop",  // neon street crime
  "https://images.unsplash.com/photo-1616680214084-22670b89f5aa?q=80&w=2400&auto=format&fit=crop",  // city pursuit / chase

  // --- High-rises / Tequesta financial district ---
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2400&auto=format&fit=crop",  // glass office towers
  "https://images.unsplash.com/photo-1628027927481-a528c344ae7b?q=80&w=2400&auto=format&fit=crop",  // tequesta skyline ref
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2400&auto=format&fit=crop",  // financial district

  // --- Everglades / wild Florida / Grassrivers ---
  "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2400&auto=format&fit=crop",  // swamp airboat at sunset
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2400&auto=format&fit=crop",  // tropical water keys
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=2400&auto=format&fit=crop",  // florida marsh at dusk

  // --- Gaming / screen / media ---
  "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2400&auto=format&fit=crop",  // gaming setup neon
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400&auto=format&fit=crop",  // esports arena
  "https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400&auto=format&fit=crop",  // Vice City RTGI lighting ref

  // --- Cars / speed / racing ---
  "https://images.unsplash.com/photo-1582987144051-9031c6a85290?q=80&w=2400&auto=format&fit=crop",  // night highway speed
  "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?q=80&w=2400&auto=format&fit=crop",  // racing track action
  "https://images.unsplash.com/photo-1617531653332-bd46c16f7a76?q=80&w=2400&auto=format&fit=crop",  // muscle car night

  // --- Finance / markets / BAWSAQ ---
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2400&auto=format&fit=crop",  // stock market screens
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2400&auto=format&fit=crop",  // trading floor

  // --- Music / nightlife ---
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2400&auto=format&fit=crop",  // concert neon
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2400&auto=format&fit=crop",  // DJ lights
  "https://images.unsplash.com/photo-1629935635086-1855c8d125cc?q=80&w=2400&auto=format&fit=crop",  // neon club interior

  // --- Heist / corporate espionage ---
  "https://images.unsplash.com/photo-1629934844513-df3e988a0157?q=80&w=2400&auto=format&fit=crop",  // armored pursuit / escalation
  "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2400&auto=format&fit=crop",  // data / digital intel
];

// Hash UUID or any string → stable integer
function hashId(id) {
  if (!id) return 0;
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Get the article BODY image — any GTA6-related image from the pool.
 * The header/hero already handles topic-precise imagery.
 *
 * @param {string} category - article.category (unused, kept for API compat)
 * @param {string} id       - article.id (UUID) — used to pick a stable image
 * @param {string[]} aiTags - article.aiTags (unused, kept for API compat)
 * @param {string|null} heroImage - hero URL to prevent duplication
 */
export function getFallbackImage(category, id, aiTags = [], heroImage = null) {
  const idx = hashId(id) % GTA6_POOL.length;
  let selected = GTA6_POOL[idx];

  // Never duplicate the hero — shift by 1 until different
  let shift = 0;
  while (heroImage && selected === heroImage && shift < GTA6_POOL.length) {
    shift++;
    selected = GTA6_POOL[(idx + shift) % GTA6_POOL.length];
  }
  return selected;
}

/**
 * Legacy export — kept so any old import doesn't break.
 * Just picks a different image from the same pool.
 */
export function getSecondaryFallback(id, category, aiTags = []) {
  return GTA6_POOL[(hashId(id) + 3) % GTA6_POOL.length];
}

