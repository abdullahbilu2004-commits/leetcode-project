import { getCurrentUser, json, apiError } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { listProblems } from "@/services/problemService";

export async function GET(req) {
  const rl = rateLimit(`list:${clientIp(req)}`, 120);
  if (!rl.ok) return apiError("Too many requests.", 429);
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const user = await getCurrentUser();
  if (["solved", "unsolved", "bookmarked"].includes(params.status) && !user)
    return apiError("Log in to filter by status.", 401);
  try {
    return json(await listProblems(params, user?._id));
  } catch (e) {
    return apiError("Could not load problems.", 500);
  }
}
