import { json, apiError } from "@/lib/auth";
import { dailySlug } from "@/services/problemService";

export async function GET() {
  try {
    const d = await dailySlug();
    return d.slug ? json(d) : apiError("No problems available. Run sync first.", 404);
  } catch {
    return apiError("Could not load daily challenge.", 500);
  }
}
