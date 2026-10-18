import { getCurrentUser, json, apiError } from "@/lib/auth";
import { randomSlug } from "@/services/problemService";

export async function GET(req) {
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const user = await getCurrentUser();
  try {
    const slug = await randomSlug(q, user?._id, q.exclude);
    return slug ? json({ slug }) : apiError("No problems match. Run sync first.", 404);
  } catch {
    return apiError("Could not pick a problem.", 500);
  }
}
