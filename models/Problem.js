import mongoose from "mongoose";
// Fields stay empty when the source does not provide them; nothing is invented.
const ProblemSchema = new mongoose.Schema({
  frontendId: { type: Number, required: true, index: true },
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], index: true },
  difficultyRank: { type: Number, index: true },
  isPaidOnly: { type: Boolean, default: false },
  tags: { type: [String], index: true },
  contentHtml: String,
  hints: [String],
  exampleTestcases: String,
  compareMode: { type: String, enum: ["tokens", "exact", "float"], default: "tokens" },
  // Server-only grading data (select:false => never loaded by default, never sent to the browser).
  // Populated by you through POST /api/admin/testcases; LeetCode does not provide expected outputs.
  testCases: { type: [{ _id: false, input: String, expected: String, isSample: { type: Boolean, default: false } }], select: false },
  codeSnippets: [{ lang: String, langSlug: String, code: String }],
  url: String,
  source: { type: String, default: "leetcode-graphql" },
  contentFetchedAt: Date,
}, { timestamps: true });
ProblemSchema.index({ title: "text" });
export default mongoose.models.Problem || mongoose.model("Problem", ProblemSchema);
