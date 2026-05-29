const T1_HQ = "https://img.youtube.com/vi/QdBZExpgErs/hqdefault.jpg";
const T2_HQ = "https://img.youtube.com/vi/lEwpM_CJKoQ/hqdefault.jpg";
const T1_MQ = "https://img.youtube.com/vi/QdBZExpgErs/mqdefault.jpg";
const T2_MQ = "https://img.youtube.com/vi/lEwpM_CJKoQ/mqdefault.jpg";
const T1_SD = "https://img.youtube.com/vi/QdBZExpgErs/sddefault.jpg";
const T2_SD = "https://img.youtube.com/vi/lEwpM_CJKoQ/sddefault.jpg";

const CATEGORY_FALLBACKS = {
  "Vice City":      T2_HQ,
  "Vehicles":       T1_HQ,
  "Investigations": T1_SD,
  "Markets":        T2_SD,
  "Business":       T2_MQ,
  "Counties":       T1_MQ,
  "Opinion":        T2_HQ,
  "Intel":          T1_MQ,
};

const POOL = [T1_HQ, T2_HQ, T1_MQ, T2_MQ, T1_SD, T2_SD];

export function getFallbackImage(category, id) {
  if (category && CATEGORY_FALLBACKS[category]) {
    return CATEGORY_FALLBACKS[category];
  }
  return POOL[(id ?? 0) % POOL.length];
}

export function getSecondaryFallback(id) {
  return POOL[((id ?? 0) + 3) % POOL.length];
}
