/**
 * ARTICLE BODY IMAGE RULES (see ARTICLE_LAYOUT_RULES.md)
 * - Body image MUST be contextually related to the article topic
 * - Body image MUST NOT duplicate the hero/header image
 * - Selection priority: aiTags → category → id-hash tiebreaker
 */

// Thematic image pools — Unsplash/static collections matched to article topics
const POOLS = {
  // GTA 6 / Vice City / Florida / Trailers / Tech
  gta_vice: [
    "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?q=80&w=2400&auto=format&fit=crop", // palm trees beach sunset
    "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=2400&auto=format&fit=crop", // tropical neon city
    "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=2400&auto=format&fit=crop", // palm trees sunset — Vice City
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2400&auto=format&fit=crop", // florida keys water
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400&auto=format&fit=crop", // neon Miami-style street
  ],

  // Characters / Lucia / Jason / Cast / Couple / Romance / Outlaws
  characters: [
    "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/8f27bda64f64ebd6453620848c5ec42959dae5b3db7d13932e1b573769470f79.png", // Lucia Caminos artwork
    "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/18ea9848372b348f0168b03c23d7b02531d161f51b1f30a4a089c2374b0e293c.png", // Jason Duval artwork
    "https://static.prod-images.emergentagent.com/jobs/133190d3-a699-44bf-a8c9-cce9bb2365f6/images/6dccb50f1f97f2f4f27319ab01773127d24f381cb080704869c46c535155b382.png", // Lucia and Jason on getaway
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=2400&auto=format&fit=crop", // beach couple sunset
  ],

  // Leaks / Dark city / Screenshots
  leaks: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2400&auto=format&fit=crop", // dark city alley
    "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2400&auto=format&fit=crop", // noir skyline
    "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2400&auto=format&fit=crop", // city lights night
    "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?q=80&w=2400&auto=format&fit=crop", // rain-slicked highway night
  ],

  // Industry / Union / Legal / Business / Corporate
  corporate: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2400&auto=format&fit=crop", // glass office towers
    "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2400&auto=format&fit=crop", // corporate meeting
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2400&auto=format&fit=crop", // people walking office
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2400&auto=format&fit=crop", // team at work
  ],

  // Media / Video / YouTube / Entertainment / Cinema
  media: [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2400&auto=format&fit=crop", // cinema screen
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2400&auto=format&fit=crop", // movie theatre
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=2400&auto=format&fit=crop", // gaming setup neon
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2400&auto=format&fit=crop", // esports arena
  ],

  // Crime / Police / Heist / Urban
  crime: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2400&auto=format&fit=crop", // dark alley
    "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?q=80&w=2400&auto=format&fit=crop", // police lights / night road
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2400&auto=format&fit=crop", // urban night
    "https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=2400&auto=format&fit=crop", // neon street crime
  ],

  // Markets / Finance / Economy / Sales
  markets: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=2400&auto=format&fit=crop", // stock market screens
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2400&auto=format&fit=crop", // financial district
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2400&auto=format&fit=crop", // trading floor
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=2400&auto=format&fit=crop", // analytics dashboard
  ],

  // Sports / Racing / Action
  sports: [
    "https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?q=80&w=2400&auto=format&fit=crop", // racing car track
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=2400&auto=format&fit=crop", // stadium
    "https://images.unsplash.com/photo-1567057419565-4349c49d8a04?q=80&w=2400&auto=format&fit=crop", // sports action
  ],

  // Music / Soundtrack / Concert
  music: [
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2400&auto=format&fit=crop", // concert neon
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2400&auto=format&fit=crop", // music stage
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2400&auto=format&fit=crop", // DJ lights
  ],
};

// Hash UUID string → stable integer
function hashId(id) {
  if (!id) return 0;
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Map tags/category to a pool key
function resolvePool(category, aiTags) {
  const tags = (aiTags || []).map((t) => t.toLowerCase()).join(" ");
  const cat = (category || "").toLowerCase();
  const combined = `${tags} ${cat}`;

  if (/lucia|jason|character|cast|actor|lovers|romance|outlaw|relationship|couple/.test(combined)) return "characters";
  if (/gta|vice|rockstar|trailer|rage|engine|fps|performance|florida|leonida|tech|ai|strand|crowd/.test(combined)) return "gta_vice";
  if (/union|lawsuit|legal|workers|rights|iwgb|fired|dispute/.test(combined)) return "corporate";
  if (/leak|screenshot|reveal|rumour|rumor|datamine|insider/.test(combined)) return "leaks";
  if (/video|youtube|media|entertainment|cinema|film|movie|channel/.test(combined)) return "media";
  if (/crime|police|heist|robbery|arrest|theft|gang/.test(combined)) return "crime";
  if (/market|stock|business|economy|sales|revenue|financial|investor|take-two/.test(combined)) return "markets";
  if (/sport|race|racing|car|vehicle|speed|driver/.test(combined)) return "sports";
  if (/music|soundtrack|song|audio|score|concert/.test(combined)) return "music";

  // Category fallbacks
  if (/characters?/.test(cat)) return "characters";
  if (/leaks?/.test(cat)) return "leaks";
  if (/world|news|global/.test(cat)) return "corporate";
  if (/media/.test(cat)) return "media";
  if (/vehicle/.test(cat)) return "sports";
  if (/market/.test(cat)) return "markets";

  return "gta_vice"; // default — this is a GTA 6 site
}

/**
 * Get the article body image — contextually related to the article topic.
 * @param {string} category - article.category
 * @param {string} id - article.id (UUID)
 * @param {string[]} aiTags - article.aiTags array
 * @param {string|null} heroImage - the URL of the hero image to prevent duplication
 */
export function getFallbackImage(category, id, aiTags = [], heroImage = null) {
  const poolKey = resolvePool(category, aiTags);
  const pool = POOLS[poolKey];
  let selected = pool[hashId(id) % pool.length];

  // Guarantee we NEVER duplicate the hero image by shifting if they match
  if (heroImage && selected === heroImage) {
    selected = pool[(hashId(id) + 1) % pool.length];
  }
  return selected;
}

/**
 * Get the secondary body image — guaranteed different from getFallbackImage.
 * Uses a different pool to ensure visual variety.
 * @param {string} id - article.id (UUID)
 * @param {string} category - article.category
 * @param {string[]} aiTags - article.aiTags array
 */
export function getSecondaryFallback(id, category, aiTags = []) {
  const primaryPoolKey = resolvePool(category, aiTags);
  // Pick an adjacent pool that's guaranteed different from primary
  const allKeys = Object.keys(POOLS);
  const primaryIdx = allKeys.indexOf(primaryPoolKey);
  const secondaryKey = allKeys[(primaryIdx + 1) % allKeys.length];
  const pool = POOLS[secondaryKey];
  return pool[(hashId(id) + 2) % pool.length];
}
