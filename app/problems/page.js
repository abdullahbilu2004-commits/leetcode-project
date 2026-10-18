import Link from "next/link";
import { Terminal } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listProblems } from "@/services/problemService";
import { getUserMarks } from "@/services/userStateService";
import { PAGE_KEYS, FILTER_KEYS, pick, buildQS } from "@/lib/query";
import ProblemFilters from "@/components/ProblemFilters";
import ProblemRow from "@/components/ProblemRow";
import ProblemCard from "@/components/ProblemCard";
import Pagination from "@/components/Pagination";
import QuickPick from "@/components/QuickPick";

export const metadata = { title: "Problems" };

export default async function ProblemsPage({ searchParams }) {
  const params = pick(await searchParams, PAGE_KEYS);
  const user = await getCurrentUser();
  if (!user) delete params.status;
  const data = await listProblems(params, user?._id);
  const marks = await getUserMarks(user?._id, data.items.map((p) => p._id));
  const fqs = buildQS(pick(params, FILTER_KEYS)); // carried into problem links so prev/next respects filters
  const cards = params.view === "cards";
  const common = (p) => ({
    p, loggedIn: !!user,
    href: `/problems/${p.slug}${fqs ? `?${fqs}` : ""}`,
    solved: marks.solved.has(String(p._id)), bookmarked: marks.bookmarked.has(String(p._id)),
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Problems</h1>
          <p className="mt-1 text-sm text-muted">
            {data.matching.toLocaleString()} of {data.totalAll.toLocaleString()} problems shown. {data.withContent.toLocaleString()} have statements cached.
          </p>
        </div>
        <div className="flex gap-2"><QuickPick kind="random" qs={fqs} /><QuickPick kind="daily" /></div>
      </div>
      <ProblemFilters tags={data.tags} loggedIn={!!user} params={params} />

      <div className="mt-5">
        {data.totalAll === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center">
            <Terminal className="mx-auto text-muted" />
            <h2 className="mt-3 font-medium">No problems imported yet</h2>
            <p className="mt-1 text-sm text-muted">Run the import once from your terminal, then reload this page.</p>
            <code className="mt-4 inline-block max-w-full overflow-x-auto rounded-md bg-raised px-3 py-2 font-mono text-xs">
              curl -X POST -H "x-sync-token: YOUR_SYNC_ADMIN_TOKEN" http://localhost:3000/api/problems/sync
            </code>
          </div>
        ) : data.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-10 text-center">
            <h2 className="font-medium">No problems match these filters</h2>
            <Link href="/problems" className="mt-2 inline-block text-sm text-accent hover:underline">Clear all filters</Link>
          </div>
        ) : cards ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{data.items.map((p) => <ProblemCard key={p.slug} {...common(p)} />)}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-line bg-surface">
            <table className="w-full text-left">
              <thead className="text-xs text-muted">
                <tr><th className="w-10 py-2.5 pl-4"><span className="sr-only">Solved</span></th><th className="w-14 py-2.5">ID</th><th className="py-2.5">Title</th>
                  <th className="py-2.5">Difficulty</th><th className="hidden py-2.5 md:table-cell">Topics</th><th className="py-2.5"><span className="sr-only">Bookmark</span></th></tr>
              </thead>
              <tbody>{data.items.map((p) => <ProblemRow key={p.slug} {...common(p)} />)}</tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={data.page} pages={data.pages} params={params} />
    </main>
  );
}
