import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Problem from "@/models/Problem";
import Bookmark from "@/models/Bookmark";
import UserProgress from "@/models/UserProgress";
import { fetchProblemPage, fetchProblemDetail, fetchDailySlug } from "@/services/leetcode";

const DETAIL_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const LIST_FIELDS = "frontendId slug title difficulty tags isPaidOnly url";
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function syncProblemList() {
  await connectDB();
  let skip = 0, total = Infinity, upserted = 0;
  while (skip < total) {
    const page = await fetchProblemPage(skip, 100);
    total = page.total;
    if (!page.items.length) break;
    const res = await Problem.bulkWrite(
      page.items.map((p) => ({
        updateOne: { filter: { slug: p.slug }, update: { $set: p }, upsert: true },
      })),
      { ordered: false }
    );
    upserted += res.upsertedCount + res.modifiedCount;
    skip += page.items.length;
  }
  return { total: total === Infinity ? 0 : total, processed: skip, upserted };
}

export async function getProblem(slug) {
  await connectDB();
  let p = await Problem.findOne({ slug }).lean();
  if (!p) return { problem: null };
  const stale = !p.contentFetchedAt || Date.now() - p.contentFetchedAt.getTime() > DETAIL_TTL_MS;
  if (stale) {
    try {
      const d = await fetchProblemDetail(slug);
      if (d) {
        // p = await Problem.findOneAndUpdate(
        //   { slug },
        //   { $set: { ...d, contentFetchedAt: new Date() } },
        //   { new: true }
        // ).lean();
        p = await Problem.findOneAndUpdate(
  { slug },
  { $set: { ...d, contentFetchedAt: new Date() } },
  { returnDocument: "after" }
).lean();
      }
    } catch (e) {
      // Fall back to whatever is cached; tell the caller content may be unavailable.
      return { problem: p, warning: `Could not refresh from LeetCode: ${e.message}` };
    }
  }
  return {
    problem: p,
    warning: !p.contentHtml
      ? p.isPaidOnly
        ? "This is a premium problem; its statement is not available."
        : "Problem statement is currently unavailable."
      : null,
  };
}

export async function buildFilter({ q, difficulty, tag, status }, userId) {
  const f = {};
  if (q) {
    const term = q.trim().slice(0, 100);
    f.$or = /^\d+$/.test(term)
      ? [{ frontendId: Number(term) }]
      : [{ title: { $regex: esc(term), $options: "i" } }];
  }
  if (["Easy", "Medium", "Hard"].includes(difficulty)) f.difficulty = difficulty;
  if (tag) f.tags = tag;
  if (userId && ["solved", "unsolved", "bookmarked"].includes(status)) {
    const uid = new mongoose.Types.ObjectId(String(userId));
    if (status === "bookmarked") {
      f._id = { $in: (await Bookmark.find({ user: uid }).distinct("problem")) };
    } else {
      const solved = await UserProgress.find({ user: uid, status: "solved" }).distinct("problem");
      f._id = status === "solved" ? { $in: solved } : { $nin: solved };
    }
  }
  return f;
}

export function buildSort(sort = "id", order = "asc") {
  const dir = order === "desc" ? -1 : 1;
  if (sort === "title") return { title: dir, frontendId: 1 };
  if (sort === "difficulty") return { difficultyRank: dir, frontendId: 1 };
  return { frontendId: dir };
}

export async function listProblems(params, userId) {
  await connectDB();
  const page = Math.max(1, parseInt(params.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
  const filter = await buildFilter(params, userId);
  const [items, matching, totalAll, withContent, tags] = await Promise.all([
    Problem.find(filter).sort(buildSort(params.sort, params.order)).skip((page - 1) * limit).limit(limit).select(LIST_FIELDS).lean(),
    Problem.countDocuments(filter),
    Problem.estimatedDocumentCount(),
    Problem.countDocuments({ contentHtml: { $type: "string" } }),
    Problem.distinct("tags"),
  ]);
  return { items, page, limit, pages: Math.ceil(matching / limit), matching, totalAll, withContent, tags: tags.sort() };
}

// Prev/next within the same filter+sort. Loads only slugs, so it stays cheap.
export async function navigate(slug, params, userId) {
  await connectDB();
  const filter = await buildFilter(params, userId);
  const slugs = (await Problem.find(filter).sort(buildSort(params.sort, params.order)).select("slug").lean()).map((d) => d.slug);
  const i = slugs.indexOf(slug);
  if (i === -1) return { found: false, prev: null, next: null };
  return { found: true, index: i + 1, total: slugs.length, prev: slugs[i - 1] || null, next: slugs[i + 1] || null };
}

export async function randomSlug(params, userId, exclude) {
  await connectDB();
  const filter = await buildFilter(params, userId);
  filter.isPaidOnly = false;
  if (exclude) filter.slug = { $ne: exclude };
  const [d] = await Problem.aggregate([{ $match: filter }, { $sample: { size: 1 } }, { $project: { slug: 1 } }]);
  return d?.slug || null;
}

const dailyCache = global._daily || (global._daily = {});
export async function dailySlug() {
  const day = new Date().toISOString().slice(0, 10);
  if (dailyCache.day === day && dailyCache.slug) return { slug: dailyCache.slug, source: dailyCache.source, date: day };
  await connectDB();
  try {
    const s = await fetchDailySlug();
    if (s && (await Problem.exists({ slug: s }))) {
      Object.assign(dailyCache, { day, slug: s, source: "leetcode" });
      return { slug: s, source: "leetcode", date: day };
    }
  } catch {}
  // Fallback: deterministic pick from our own free problems (clearly labelled).
  const free = await Problem.find({ isPaidOnly: false }).sort({ frontendId: 1 }).select("slug").lean();
  if (!free.length) return { slug: null, source: "none", date: day };
  const n = Number(day.replaceAll("-", ""));
  const slug = free[n % free.length].slug;
  Object.assign(dailyCache, { day, slug, source: "fallback" });
  return { slug, source: "fallback", date: day };
}
