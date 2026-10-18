// Judge0 client. All execution happens on the remote judge, never inside Next.js.
const DEFAULT_IDS = { javascript: 63, python: 71, java: 62, cpp: 54 }; // Judge0 CE defaults
const MAX_TEXT = 10000;

export class JudgeError extends Error {
  constructor(message, code, status = 502) { super(message); this.code = code; this.status = status; }
}
export const judgeConfigured = () => !!process.env.JUDGE0_URL;

const langIds = () => {
  try { return { ...DEFAULT_IDS, ...JSON.parse(process.env.JUDGE0_LANGUAGE_IDS || "{}") }; } catch { return DEFAULT_IDS; }
};
const b64 = (s) => Buffer.from(s ?? "", "utf8").toString("base64");
const unb64 = (s) => (s ? Buffer.from(s, "base64").toString("utf8").slice(0, MAX_TEXT) : "");

function headers() {
  const h = { "Content-Type": "application/json" };
  const key = process.env.JUDGE0_API_KEY;
  if (process.env.JUDGE0_API_HOST) { h["X-RapidAPI-Key"] = key || ""; h["X-RapidAPI-Host"] = process.env.JUDGE0_API_HOST; }
  else if (key) h["X-Auth-Token"] = key;
  return h;
}

async function call(url, init, ms = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal, cache: "no-store" });
    if (res.status === 429) throw new JudgeError("The judge is rate limiting requests. Try again shortly.", "JUDGE_RATE_LIMITED", 503);
    if (res.status === 401 || res.status === 403) throw new JudgeError("The judge rejected the credentials. Check JUDGE0_API_KEY.", "JUDGE_AUTH", 503);
    if (!res.ok) throw new JudgeError(`The judge returned an error (${res.status}).`, "JUDGE_ERROR", 502);
    return await res.json();
  } catch (e) {
    if (e instanceof JudgeError) throw e;
    throw new JudgeError(e.name === "AbortError" ? "The judge did not respond in time." : "The judge is unreachable.", "JUDGE_UNAVAILABLE", 503);
  } finally { clearTimeout(t); }
}

function kindOf(id) {
  if (id === 3 || id === 4) return "ok";
  if (id === 5) return "time_limit";
  if (id === 6) return "compile_error";
  if (id >= 7 && id <= 12) return "runtime_error";
  if (id === 14) return "runtime_error";
  return "internal_error";
}

export async function executeOnJudge({ language, code, stdin = "" }) {
  if (!judgeConfigured()) throw new JudgeError("Code execution is not configured on this server.", "JUDGE0_NOT_CONFIGURED", 503);
  const base = process.env.JUDGE0_URL.replace(/\/$/, "");
  const cpu = Math.min(Number(process.env.JUDGE0_CPU_SECONDS) || 5, 10);
  const mem = Math.min(Number(process.env.JUDGE0_MEMORY_KB) || 256000, 512000);
  const created = await call(`${base}/submissions?base64_encoded=true&wait=false`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({
      source_code: b64(code), language_id: langIds()[language], stdin: b64(stdin),
      cpu_time_limit: cpu, wall_time_limit: cpu * 2, memory_limit: mem,
    }),
  });
  if (!created?.token) throw new JudgeError("The judge did not accept the submission.", "JUDGE_ERROR");
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 700));
    const r = await call(`${base}/submissions/${created.token}?base64_encoded=true&fields=status,stdout,stderr,compile_output,message,time,memory`, { headers: headers() });
    const id = r?.status?.id;
    if (id > 2) {
      return {
        kind: kindOf(id), judgeStatus: r.status.description,
        stdout: unb64(r.stdout), stderr: unb64(r.stderr), compileOutput: unb64(r.compile_output), message: unb64(r.message),
        timeMs: r.time != null ? Math.round(parseFloat(r.time) * 1000) : null, memoryKb: r.memory ?? null,
      };
    }
  }
  throw new JudgeError("The judge took too long to finish.", "JUDGE_TIMEOUT", 504);
}
