import { getCurrentUser, json, apiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { submitSchema } from "@/lib/validation";
import { failure, tooLarge } from "@/lib/http";
import { submitSolution, listSubmissions } from "@/services/submissionService";

export const maxDuration = 60;

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Log in to submit solutions.", 401);
  if (!rateLimit(`submit:${user._id}`, 10).ok) return apiError("Too many submissions. Wait a moment and try again.", 429);
  if (tooLarge(req)) return apiError("Request is too large.", 413);
  const parsed = submitSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid request.");
  try {
    const result = await submitSolution({ userId: user._id, ...parsed.data });
    return result ? json(result) : apiError("Problem not found.", 404);
  } catch (e) { return failure(e); }
}

export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", 401);
  const sp = new URL(req.url).searchParams;
  const slug = sp.get("slug");
  if (slug && !/^[a-z0-9-]{1,120}$/.test(slug)) return apiError("Invalid slug.");
  return json(await listSubmissions(user._id, { page: parseInt(sp.get("page")) || 1, limit: parseInt(sp.get("limit")) || 20, slug }));
}
