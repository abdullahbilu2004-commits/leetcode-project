import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Problem from "@/models/Problem";
import Submission from "@/models/Submission";
import UserProgress from "@/models/UserProgress";
import { executeOnJudge } from "@/services/judge0";

export function compareOutput(actual, expected, mode = "tokens") {
  const norm = (s) => String(s ?? "").replace(/\r\n/g, "\n");
  if (mode === "exact") return norm(actual).replace(/\s+$/, "") === norm(expected).replace(/\s+$/, "");
  const a = norm(actual).trim().split(/\s+/).filter(Boolean);
  const e = norm(expected).trim().split(/\s+/).filter(Boolean);
  if (a.length !== e.length) return false;
  if (mode === "float") {
    return a.every((t, i) => t === e[i] || (isFinite(+t) && isFinite(+e[i]) && Math.abs(+t - +e[i]) <= 1e-6 * Math.max(1, Math.abs(+e[i]))));
  }
  return a.every((t, i) => t === e[i]);
}

const KIND_LABEL = { compile_error: "Compilation Error", runtime_error: "Runtime Error", time_limit: "Time Limit Exceeded", internal_error: "Judge Error" };

// Run: executes the code as-is with custom stdin. It is NEVER graded.
export async function runCode({ slug, language, code, stdin }) {
  await connectDB();
  if (!(await Problem.exists({ slug }))) return null;
  const r = await executeOnJudge({ language, code, stdin });
  return { ...r, status: r.kind === "ok" ? "Executed" : KIND_LABEL[r.kind], graded: false };
}

async function inChunks(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

export async function submitSolution({ userId, slug, language, code }) {
  await connectDB();
  const problem = await Problem.findOne({ slug }).select("+testCases compareMode").lean();
  if (!problem) return null;
  const cases = problem.testCases || [];
  const save = (extra) => Submission.create({ user: userId, problem: problem._id, language, code, mode: "submit", ...extra });
  const markProgress = async (solved) => {
    if (solved) return UserProgress.updateOne({ user: userId, problem: problem._id }, { $set: { status: "solved", solvedAt: new Date() } }, { upsert: true });
    try { await UserProgress.updateOne({ user: userId, problem: problem._id, status: { $ne: "solved" } }, { $set: { status: "attempted" } }, { upsert: true }); }
    catch (e) { if (e?.code !== 11000) throw e; }
  };

  if (!cases.length) {
    const message = "No server-side test cases are configured for this problem, so this submission could not be graded.";
    const s = await save({ status: "Not graded", fullyVerified: false, passed: 0, total: 0, error: message });
    await markProgress(false);
    return { id: s._id, status: "Not graded", passed: 0, total: 0, fullyVerified: false, message, cases: [] };
  }

  // Run the first case alone so a compile error is reported once instead of N times.
  const first = await executeOnJudge({ language, code, stdin: cases[0].input });
  if (first.kind === "compile_error") {
    const s = await save({ status: "Compilation Error", fullyVerified: false, passed: 0, total: cases.length, error: first.compileOutput });
    await markProgress(false);
    return { id: s._id, status: "Compilation Error", passed: 0, total: cases.length, fullyVerified: false, compileOutput: first.compileOutput, cases: [] };
  }
  const rest = await inChunks(cases.slice(1), 4, (c) => executeOnJudge({ language, code, stdin: c.input }));
  const results = [first, ...rest];

  const evaluated = results.map((r, i) => {
    const c = cases[i];
    let status;
    if (r.kind === "ok") status = compareOutput(r.stdout, c.expected, problem.compareMode) ? "Passed" : "Wrong Answer";
    else status = KIND_LABEL[r.kind];
    const out = { index: i + 1, sample: !!c.isSample, status };
    if (c.isSample) Object.assign(out, { input: c.input, expected: c.expected, actual: r.stdout, stderr: r.stderr });
    return out;
  });

  const passed = evaluated.filter((e) => e.status === "Passed").length;
  const failing = evaluated.find((e) => e.status !== "Passed");
  const hasHidden = cases.some((c) => !c.isSample);
  let status, message;
  if (failing) {
    status = failing.status;
  } else if (hasHidden) {
    status = "Accepted";
  } else {
    status = "Samples Passed";
    message = "All sample cases passed, but no hidden cases are configured, so this is not a full verification.";
  }
  const fullyVerified = status === "Accepted";
  const timeMs = Math.max(...results.map((r) => r.timeMs || 0));
  const memoryKb = Math.max(...results.map((r) => r.memoryKb || 0));
  const s = await save({ status, fullyVerified, passed, total: cases.length, timeMs, memoryKb, error: failing && !failing.sample ? undefined : failing?.stderr });
  await markProgress(fullyVerified);
  return { id: s._id, status, passed, total: cases.length, fullyVerified, timeMs, memoryKb, message, cases: evaluated };
}

export async function listSubmissions(userId, { page = 1, limit = 20, slug }) {
  await connectDB();
  const filter = { user: userId };
  if (slug) { const p = await Problem.findOne({ slug }).select("_id").lean(); filter.problem = p?._id || new mongoose.Types.ObjectId(); }
  const lim = Math.min(50, Math.max(1, limit));
  const [items, total] = await Promise.all([
    Submission.find(filter).sort({ createdAt: -1 }).skip((Math.max(1, page) - 1) * lim).limit(lim)
      .select("-code").populate("problem", "slug title frontendId difficulty").lean(),
    Submission.countDocuments(filter),
  ]);
  return { items, total, page, pages: Math.ceil(total / lim) };
}
