import { connectDB } from "@/lib/db";
import Problem from "@/models/Problem";
import UserProgress from "@/models/UserProgress";
import Submission from "@/models/Submission";
import Bookmark from "@/models/Bookmark";

const toMap = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));

export async function getProfileStats(userId) {
  await connectDB();
  const [solvedRows, totalRows, attempted, submissions, accepted, bookmarks, recent] = await Promise.all([
    UserProgress.aggregate([
      { $match: { user: userId, status: "solved" } },
      { $lookup: { from: "problems", localField: "problem", foreignField: "_id", as: "p" } },
      { $unwind: "$p" },
      { $group: { _id: "$p.difficulty", count: { $sum: 1 } } },
    ]),
    Problem.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }]),
    UserProgress.countDocuments({ user: userId, status: "attempted" }),
    Submission.countDocuments({ user: userId }),
    Submission.countDocuments({ user: userId, fullyVerified: true }),
    Bookmark.countDocuments({ user: userId }),
    Submission.find({ user: userId }).sort({ createdAt: -1 }).limit(8).select("-code")
      .populate("problem", "slug title frontendId difficulty").lean(),
  ]);
  const s = toMap(solvedRows), t = toMap(totalRows);
  const levels = ["Easy", "Medium", "Hard"].map((d) => ({ level: d, solved: s[d] || 0, total: t[d] || 0 }));
  return { levels, solvedTotal: levels.reduce((n, l) => n + l.solved, 0), problemTotal: levels.reduce((n, l) => n + l.total, 0), attempted, submissions, accepted, bookmarks, recent };
}
