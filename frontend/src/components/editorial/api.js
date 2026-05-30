// api.js — Shared API helper for the Leonida Vice Editorial panels
let BASE_URL = process.env.REACT_APP_BACKEND_URL || "";
if (!BASE_URL) BASE_URL = "https://fanny-production-4c28.up.railway.app";
BASE_URL = BASE_URL.trim();
if (BASE_URL.endsWith("/")) BASE_URL = BASE_URL.slice(0, -1);
if (BASE_URL && !BASE_URL.startsWith("http://") && !BASE_URL.startsWith("https://")) {
  BASE_URL = `https://${BASE_URL}`;
}
const API_BASE = `${BASE_URL}/api`;

export function apiCall(path, key, method = "GET", body, extraHeaders = {}) {
  return fetch(`${API_BASE}${path}`, {
    method,
    headers: { 
      "Content-Type": "application/json", 
      "X-Editorial-Key": key,
      "Authorization": `Bearer ${key}`,
      "X-Groq-Api-Key": key,
      ...extraHeaders
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async r => {
    const isJson = r.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await r.json() : null;
    if (!r.ok) {
      let errMsg = "Request failed";
      if (data && data.detail) {
        if (typeof data.detail === "string") {
          errMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errMsg = data.detail.map(err => err.msg || JSON.stringify(err)).join(", ");
        } else {
          errMsg = JSON.stringify(data.detail);
        }
      } else if (data && data.message) {
        errMsg = data.message;
      } else {
        errMsg = r.statusText || errMsg;
      }
      const error = new Error(errMsg);
      error.status = r.status;
      error.data = data;
      throw error;
    }
    return data;
  });
}

export const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

export const REJECTION_REASONS = ["Off-topic", "AI hallucination", "Duplicate", "Low quality", "Misleading title", "Outdated", "Other"];

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%230c0c0e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', 'Bebas Neue', sans-serif" font-size="20" fill="%23ff2a6d" letter-spacing="4">LEONIDA VICE</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="8" fill="%2305d9e8" opacity="0.6" letter-spacing="2">MEDIA MISSING</text></svg>`;
