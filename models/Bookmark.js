import mongoose from "mongoose";
const S = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true },
}, { timestamps: true });
S.index({ user: 1, problem: 1 }, { unique: true });
export default mongoose.models.Bookmark || mongoose.model("Bookmark", S);
