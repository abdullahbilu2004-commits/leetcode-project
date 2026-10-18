import mongoose from "mongoose";
const S = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
  status: { type: String, enum: ["unsolved", "attempted", "solved"], default: "unsolved" },
  solvedAt: Date,
  drafts: { type: Map, of: String, default: {} },
}, { timestamps: true });
S.index({ user: 1, problem: 1 }, { unique: true });
export default mongoose.models.UserProgress || mongoose.model("UserProgress", S);
