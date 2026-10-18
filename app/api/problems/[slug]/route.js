import { json, apiError } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { getProblem } from "@/services/problemService";

export async function GET(req, { params }) {
  const rl = rateLimit(`detail:${clientIp(req)}`, 60);
  if (!rl.ok) return apiError("Too many requests.", 429);
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return apiError("Invalid slug.", 400);
  try {
    const { problem, warning } = await getProblem(slug);
    if (!problem) return apiError("Problem not found.", 404);
    delete problem.testCases;
    return json({ problem, warning });
  } catch {
    return apiError("Could not load problem.", 500);
  }
}
