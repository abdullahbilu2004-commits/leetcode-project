export const FILTER_KEYS = ["q", "difficulty", "tag", "status", "sort", "order"];
export const PAGE_KEYS = [...FILTER_KEYS, "page", "view"];
export function pick(obj, keys) {
  const out = {};
  for (const k of keys) {
    const v = Array.isArray(obj[k]) ? obj[k][0] : obj[k];
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}
export function buildQS(obj) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  return sp.toString();
}
