import { JudgeError } from "@/services/judge0";

export function failure(e) {
  if (e instanceof JudgeError) return Response.json({ error: e.message, code: e.code }, { status: e.status });
  return Response.json({ error: "Unexpected server error." }, { status: 500 });
}
export function tooLarge(req, max = 200_000) {
  return Number(req.headers.get("content-length") || 0) > max;
}
