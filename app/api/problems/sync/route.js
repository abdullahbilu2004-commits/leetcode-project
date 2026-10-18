import { json, apiError } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { syncProblemList } from "@/services/problemService";

export const maxDuration = 60;

// Usage: curl -X POST -H "x-sync-token: $SYNC_ADMIN_TOKEN" http://localhost:3000/api/problems/sync
export async function POST(req) {
  const token = process.env.SYNC_ADMIN_TOKEN;
  if (!token || req.headers.get("x-sync-token") !== token) return apiError("Forbidden.", 403);
  if (!rateLimit(`sync:${clientIp(req)}`, 3, 600_000).ok) return apiError("Too many sync requests.", 429);
  try {
    return json(await syncProblemList());
  } catch (e) {
    return apiError(`Sync failed: ${e.message}`, 502);
  }
}
