import mongoose from "mongoose";
const SubmissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: "Problem", required: true, index: true },
  language: { type: String, required: true },
  code: { type: String, required: true, maxlength: 65536 },
  mode: { type: String, enum: ["run", "submit"], required: true },
  status: { type: String, required: true },
  passed: Number, total: Number, timeMs: Number, memoryKb: Number,
  fullyVerified: { type: Boolean, default: false },
  error: String,
}, { timestamps: true });
SubmissionSchema.index({ user: 1, createdAt: -1 });
export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
