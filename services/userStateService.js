import mongoose from "mongoose";
import UserProgress from "@/models/UserProgress";
import Bookmark from "@/models/Bookmark";

// Returns Sets of problem ids (as strings) that this user solved / bookmarked, limited to the given ids.
export async function getUserMarks(userId, problemIds) {
  if (!userId || !problemIds.length) return { solved: new Set(), bookmarked: new Set() };
  const uid = new mongoose.Types.ObjectId(String(userId));
  const [solved, marks] = await Promise.all([
    UserProgress.find({ user: uid, problem: { $in: problemIds }, status: "solved" }).distinct("problem"),
    Bookmark.find({ user: uid, problem: { $in: problemIds } }).distinct("problem"),
  ]);
  return { solved: new Set(solved.map(String)), bookmarked: new Set(marks.map(String)) };
}
