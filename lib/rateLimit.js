// In-memory limiter: fine for dev/single instance. On Vercel use Upstash/Redis for real limits.
const hits = global._rl || (global._rl = new Map());
export function rateLimit(key, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const rec = hits.get(key);
  if (!rec || rec.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  rec.count += 1;
  return rec.count > limit
    ? { ok: false, retryAfter: Math.ceil((rec.reset - now) / 1000) }
    : { ok: true };
}
export function clientIp(req) {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
