import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getCurrentUser, json, apiError } from "@/lib/auth";
import Bookmark from "@/models/Bookmark";
import Problem from "@/models/Problem";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", 401);
  await connectDB();
  const marks = await Bookmark.find({ user: user._id }).sort({ createdAt: -1 })
    .populate("problem", "frontendId slug title difficulty tags").lean();
  return json({ bookmarks: marks.filter((m) => m.problem).map((m) => m.problem) });
}

// POST { slug } toggles the bookmark for the current user only.
export async function POST(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", 401);
  const parsed = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,120}$/) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid slug.");
  await connectDB();
  const p = await Problem.findOne({ slug: parsed.data.slug }).select("_id").lean();
  if (!p) return apiError("Problem not found.", 404);
  const del = await Bookmark.deleteOne({ user: user._id, problem: p._id });
  if (del.deletedCount) return json({ bookmarked: false });
  await Bookmark.create({ user: user._id, problem: p._id });
  return json({ bookmarked: true });
}
