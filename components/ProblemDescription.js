import { ExternalLink, Info, Lock } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";

export default function ProblemDescription({ problem, warning }) {
  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold">{problem.frontendId}. {problem.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge level={problem.difficulty} />
        {problem.isPaidOnly && <span className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-xs text-muted"><Lock size={11} />Premium</span>}
        {(problem.tags || []).map((t) => <span key={t} className="rounded-full bg-raised px-2 py-0.5 text-xs text-muted">{t}</span>)}
      </div>
      {problem.url && (
        <a href={problem.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:underline">
          View on LeetCode <ExternalLink size={13} />
        </a>
      )}
      {warning && (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-line bg-raised p-3 text-sm text-muted"><Info size={16} className="mt-0.5 shrink-0" />{warning}</p>
      )}
      {problem.contentHtml && <div className="lc-content mt-5" dangerouslySetInnerHTML={{ __html: problem.contentHtml }} />}
      {problem.hints?.length > 0 && (
        <div className="mt-6 space-y-2">
          <h2 className="text-sm font-medium">Hints</h2>
          {problem.hints.map((h, i) => (
            <details key={i} className="rounded-md border border-line bg-surface px-3 py-2 text-sm">
              <summary className="cursor-pointer">Hint {i + 1}</summary>
              <div className="lc-content mt-2" dangerouslySetInnerHTML={{ __html: h }} />
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
