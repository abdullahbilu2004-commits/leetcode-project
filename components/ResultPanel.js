"use client";
import { AlertTriangle, CheckCircle2, Info, Loader2, XCircle } from "lucide-react";

const tones = { good: "text-easy", warn: "text-medium", bad: "text-hard", neutral: "text-muted" };
const toneOf = (s) =>
  s === "Accepted" || s === "Passed" ? "good"
  : ["Samples Passed", "Not graded", "Judge Error"].includes(s) ? "warn"
  : s === "Executed" ? "neutral" : "bad";

function Block({ label, text }) {
  if (!text) return null;
  return (
    <div className="mt-3">
      <div className="text-xs text-muted">{label}</div>
      <pre className="mt-1 max-h-44 overflow-auto whitespace-pre-wrap rounded-md bg-bg p-3 font-mono text-xs">{text}</pre>
    </div>
  );
}
function Stats({ r }) {
  if (r.timeMs == null && r.memoryKb == null) return null;
  return <p className="mt-2 text-xs text-muted">{r.timeMs != null && `Time: ${r.timeMs} ms. `}{r.memoryKb != null && `Memory: ${(r.memoryKb / 1024).toFixed(1)} MB.`}</p>;
}
function Heading({ status, children }) {
  const t = toneOf(status);
  const Icon = t === "good" ? CheckCircle2 : t === "bad" ? XCircle : t === "warn" ? AlertTriangle : Info;
  return <div className={`flex items-center gap-2 text-base font-semibold ${tones[t]}`}><Icon size={18} />{status}{children}</div>;
}

export default function ResultPanel({ result, busy }) {
  if (busy) return <p className="flex items-center gap-2 p-4 text-sm text-muted"><Loader2 size={16} className="animate-spin" />{busy === "submit" ? "Grading on the judge..." : "Running on the judge..."}</p>;
  if (!result) return <p className="p-4 text-sm text-muted">Run your code to see output here. Run executes your program with the input above and does not grade it.</p>;
  if (result.type === "error") {
    return (
      <div className="p-4 text-sm" role="alert">
        <p className="text-hard">{result.message}</p>
        {result.code === "JUDGE0_NOT_CONFIGURED" && <p className="mt-2 text-muted">This feature needs setup: set JUDGE0_URL (and JUDGE0_API_KEY if your judge requires one) in .env.local, then restart the server.</p>}
      </div>
    );
  }
  if (result.type === "run") {
    return (
      <div className="p-4">
        <Heading status={result.status} />
        <p className="mt-1 text-xs text-muted">Executed only. This run is not graded and is not a submission.</p>
        <Stats r={result} />
        <Block label="Compiler output" text={result.compileOutput} />
        <Block label="Output" text={result.stdout} />
        <Block label="Errors" text={result.stderr || result.message} />
        {result.status === "Executed" && !result.stdout && !result.stderr && <p className="mt-3 text-sm text-muted">The program finished without printing anything.</p>}
      </div>
    );
  }
  return (
    <div className="p-4">
      <Heading status={result.status}>{result.total > 0 && <span className="text-sm font-normal text-muted">{result.passed}/{result.total} cases passed</span>}</Heading>
      {result.message && <p className="mt-1 text-sm text-muted">{result.message}</p>}
      {result.status === "Accepted" && <p className="mt-1 text-xs text-muted">Passed every configured case, including hidden ones.</p>}
      <Stats r={result} />
      <Block label="Compiler output" text={result.compileOutput} />
      {result.cases?.length > 0 && (
        <ul className="mt-3 space-y-2">
          {result.cases.map((c) => (
            <li key={c.index} className="rounded-md border border-line p-2 text-sm">
              <div className="flex justify-between"><span>{c.sample ? `Sample ${c.index}` : `Hidden case ${c.index}`}</span><span className={tones[toneOf(c.status)]}>{c.status}</span></div>
              {c.sample && c.status !== "Passed" && (<><Block label="Input" text={c.input} /><Block label="Expected" text={c.expected} /><Block label="Your output" text={c.actual} /><Block label="Errors" text={c.stderr} /></>)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
