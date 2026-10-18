import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser, json, apiError } from "@/lib/auth";
import Submission from "@/models/Submission";

export async function GET(_req, { params }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", 401);
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return apiError("Invalid id.");
  await connectDB();
  // Scoped by user: nobody can read another user's submission.
  const s = await Submission.findOne({ _id: id, user: user._id }).populate("problem", "slug title frontendId difficulty").lean();
  return s ? json({ submission: s }) : apiError("Submission not found.", 404);
}
