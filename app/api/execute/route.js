import { getCurrentUser, json, apiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { runSchema } from "@/lib/validation";
import { failure, tooLarge } from "@/lib/http";
import { runCode } from "@/services/submissionService";

export const maxDuration = 60;

export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Log in to run code.", 401);
  if (!rateLimit(`run:${user._id}`, 20).ok) return apiError("Too many runs. Wait a moment and try again.", 429);
  if (tooLarge(req)) return apiError("Request is too large.", 413);
  const parsed = runSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid request. Code must be 1 to 65,536 characters and input at most 16,384.");
  try {
    const result = await runCode(parsed.data);
    return result ? json(result) : apiError("Problem not found.", 404);
  } catch (e) { return failure(e); }
}
