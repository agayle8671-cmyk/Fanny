// Tiny fetch wrapper around the Leonida Vice backend.
let BASE_URL = process.env.REACT_APP_BACKEND_URL || "";

// Fallback to the production backend URL if empty
if (!BASE_URL) {
  BASE_URL = "https://fanny-production-4c28.up.railway.app";
}

// Clean up whitespace
BASE_URL = BASE_URL.trim();

// Ensure trailing slash is removed if present
if (BASE_URL.endsWith("/")) {
  BASE_URL = BASE_URL.slice(0, -1);
}

// Ensure http:// or https:// is present
if (BASE_URL && !BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = `https://${BASE_URL}`;
}

const BASE = BASE_URL;

async function get(path) {
  try {
    const res = await fetch(`${BASE}/api${path}`, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    return await res.json();
  } catch (_e) {
    return null;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    let detail = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(errText);
      detail = parsed.detail || parsed.message || detail;
    } catch (_) {}
    throw new Error(detail);
  }
  return await res.json();
}

export const api = {
  listArticles: ({ category, limit = 12, offset = 0 } = {}) => {
    const params = new URLSearchParams({ limit, offset });
    if (category) params.set("category", category);
    return get(`/articles?${params.toString()}`);
  },
  trending: (limit = 10) => get(`/articles/trending?limit=${limit}`),
  article: (slug) => get(`/articles/${slug}`),
  deleteArticle: (slug, token) =>
    request(`/articles/${slug}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
  parseArticle: (rawText, token, groqKey, model = "llama3-70b-8192") =>
    request(`/editorial/parse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Groq-Api-Key": groqKey,
      },
      body: JSON.stringify({ rawText, model }),
    }),
  ingestArticles: (articles, token) =>
    request(`/articles/ingest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ articles: Array.isArray(articles) ? articles : [articles] }),
    }),
};

// Helpers
export const timeAgo = (iso) => {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const fallbackThumb = (idx = 0) => {
  const pool = [
    "https://images.unsplash.com/photo-1666032800277-607511d3869a?q=80&w=2400",
    "https://images.unsplash.com/photo-1670811456186-e73d0ace9454?q=80&w=2400",
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?q=80&w=2400",
    "https://images.unsplash.com/photo-1589066724013-06f34f2cc17c?q=80&w=2400",
    "https://images.unsplash.com/photo-1582987144051-9031c6a85290?q=80&w=2400",
    "https://images.unsplash.com/photo-1629935635086-1855c8d125cc?q=80&w=2400",
  ];
  return pool[idx % pool.length];
};
