import { connectDB } from "@/lib/db";
import { getCurrentUser, json, apiError } from "@/lib/auth";
import { draftSchema, languageSchema } from "@/lib/validation";
import { tooLarge } from "@/lib/http";
import Problem from "@/models/Problem";
import UserProgress from "@/models/UserProgress";

async function context(params) {
  const user = await getCurrentUser();
  if (!user) return { error: apiError("Not authenticated.", 401) };
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return { error: apiError("Invalid slug.") };
  await connectDB();
  const p = await Problem.findOne({ slug }).select("_id").lean();
  if (!p) return { error: apiError("Problem not found.", 404) };
  return { user, problem: p };
}

export async function GET(_req, { params }) {
  const c = await context(params);
  if (c.error) return c.error;
  const prog = await UserProgress.findOne({ user: c.user._id, problem: c.problem._id }).select("status drafts solvedAt").lean();
  return json({ status: prog?.status || "unsolved", drafts: prog?.drafts || {}, solvedAt: prog?.solvedAt || null });
}

export async function PUT(req, { params }) {
  const c = await context(params);
  if (c.error) return c.error;
  if (tooLarge(req)) return apiError("Request is too large.", 413);
  const parsed = draftSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid draft.");
  await UserProgress.updateOne({ user: c.user._id, problem: c.problem._id }, { $set: { [`drafts.${parsed.data.language}`]: parsed.data.code } }, { upsert: true });
  return json({ saved: true });
}

export async function DELETE(req, { params }) {
  const c = await context(params);
  if (c.error) return c.error;
  const lang = languageSchema.safeParse(new URL(req.url).searchParams.get("language"));
  if (!lang.success) return apiError("Invalid language.");
  await UserProgress.updateOne({ user: c.user._id, problem: c.problem._id }, { $unset: { [`drafts.${lang.data}`]: "" } });
  return json({ deleted: true });
}
