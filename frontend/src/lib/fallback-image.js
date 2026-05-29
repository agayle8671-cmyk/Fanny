// Premium GTA VI cinematic stills — unique pairs so body images never duplicate the hero thumbnail
const LANDSCAPE = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2400&auto=format&fit=crop", // night city
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2400&auto=format&fit=crop", // skyline
  "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2400&auto=format&fit=crop", // beach
  "https://images.unsplash.com/photo-1520085601670-ee14aa5fa3e8?q=80&w=2400&auto=format&fit=crop", // highway
  "https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=2400&auto=format&fit=crop", // vice city vibe
  "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=2400&auto=format&fit=crop", // tropical
  "https://images.unsplash.com/photo-1621609764180-2ca554a9d6f2?q=80&w=2400&auto=format&fit=crop", // neon street
  "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2400&auto=format&fit=crop", // urban night
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2400&auto=format&fit=crop", // coast
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?q=80&w=2400&auto=format&fit=crop", // city lights
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?q=80&w=2400&auto=format&fit=crop", // racing car
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2400&auto=format&fit=crop", // florida keys
];

// Category-specific first-body images
const CATEGORY_MAP = {
  "Leaks":          LANDSCAPE[0],
  "World":          LANDSCAPE[1],
  "Media":          LANDSCAPE[2],
  "Intel":          LANDSCAPE[3],
  "Vice City":      LANDSCAPE[4],
  "Vehicles":       LANDSCAPE[10],
  "Investigations": LANDSCAPE[5],
  "Markets":        LANDSCAPE[6],
  "Business":       LANDSCAPE[7],
  "Counties":       LANDSCAPE[8],
  "Opinion":        LANDSCAPE[9],
  "Entertainment":  LANDSCAPE[2],
  "Crime":          LANDSCAPE[0],
  "Politics":       LANDSCAPE[1],
  "Sports":         LANDSCAPE[11],
};

// Hash a string id to a stable integer index
function hashId(id) {
  if (!id) return 0;
  let h = 0;
  const s = String(id);
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getFallbackImage(category, id) {
  if (category && CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  return LANDSCAPE[hashId(id) % LANDSCAPE.length];
}

export function getSecondaryFallback(id) {
  // Always at least 4 slots away from the primary to guarantee uniqueness
  return LANDSCAPE[(hashId(id) + 4) % LANDSCAPE.length];
}
