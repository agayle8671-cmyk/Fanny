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
  }).then(r => r.json());
}

export const CATEGORIES = ["Intel", "Vice City", "Business", "Investigations", "Vehicles", "Counties", "Markets"];

export const REJECTION_REASONS = ["Off-topic", "AI hallucination", "Duplicate", "Low quality", "Misleading title", "Outdated", "Other"];
