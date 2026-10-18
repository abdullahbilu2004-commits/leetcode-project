import { connectDB } from "@/lib/db";
import { json, apiError } from "@/lib/auth";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { testCasesSchema } from "@/lib/validation";
import Problem from "@/models/Problem";

// Sets the server-side grading cases for ONE problem. Cases are stored with select:false and never returned by any public route.
// curl -X POST -H "x-sync-token: $SYNC_ADMIN_TOKEN" -H "Content-Type: application/json" \
//   -d '{"slug":"...","compareMode":"tokens","cases":[{"input":"...","expected":"...","isSample":true}]}' http://localhost:3000/api/admin/testcases
export async function POST(req) {
  const token = process.env.SYNC_ADMIN_TOKEN;
  if (!token || req.headers.get("x-sync-token") !== token) return apiError("Forbidden.", 403);
  if (!rateLimit(`admin:${clientIp(req)}`, 30).ok) return apiError("Too many requests.", 429);
  const parsed = testCasesSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid body. Need slug, optional compareMode, and 1-50 cases with input/expected.");
  await connectDB();
  const res = await Problem.updateOne({ slug: parsed.data.slug }, { $set: { testCases: parsed.data.cases, compareMode: parsed.data.compareMode } });
  return res.matchedCount ? json({ ok: true, cases: parsed.data.cases.length }) : apiError("Problem not found. Run sync first.", 404);
}
