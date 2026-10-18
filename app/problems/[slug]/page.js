import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { getProblem, navigate } from "@/services/problemService";
import { getUserMarks } from "@/services/userStateService";
import { judgeConfigured } from "@/services/judge0";
import { FILTER_KEYS, pick, buildQS } from "@/lib/query";
import { LANGUAGES } from "@/lib/languages";
import UserProgress from "@/models/UserProgress";
import ProblemDescription from "@/components/ProblemDescription";
import ProblemWorkspace from "@/components/ProblemWorkspace";
import BookmarkButton from "@/components/BookmarkButton";
import QuickPick from "@/components/QuickPick";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: slug.replace(/-/g, " ") };
}

export default async function ProblemPage({ params, searchParams }) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const filters = pick(await searchParams, FILTER_KEYS);
  const user = await getCurrentUser();
  if (!user) delete filters.status;

  const { problem, warning } = await getProblem(slug);
  if (!problem) notFound();
  delete problem.testCases;

  let nav = await navigate(slug, filters, user?._id);
  let activeFilters = filters;
  if (!nav.found) { nav = await navigate(slug, {}, user?._id); activeFilters = {}; }
  const fqs = buildQS(activeFilters);
  const link = (s) => `/problems/${s}${fqs ? `?${fqs}` : ""}`;

  const marks = await getUserMarks(user?._id, [problem._id]);
  let drafts = {};
  if (user) {
    await connectDB();
    const prog = await UserProgress.findOne({ user: user._id, problem: problem._id }).select("drafts").lean();
    drafts = prog?.drafts || {};
  }
  const snippets = {};
  for (const [key, meta] of Object.entries(LANGUAGES)) {
    const s = (problem.codeSnippets || []).find((c) => c.langSlug === meta.leetSlug);
    if (s?.code) snippets[key] = s.code;
  }
  const arrow = "grid size-8 place-items-center rounded-md border border-line";
  const plain = JSON.parse(JSON.stringify({ title: problem.title, frontendId: problem.frontendId, difficulty: problem.difficulty, isPaidOnly: problem.isPaidOnly, tags: problem.tags, url: problem.url, contentHtml: problem.contentHtml, hints: problem.hints }));

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex h-12 flex-wrap items-center gap-2 border-b border-line px-3">
        <Link href={`/problems${fqs ? `?${fqs}` : ""}`} className="flex items-center gap-1 text-sm text-muted hover:text-fg"><List size={15} />All problems</Link>
        <div className="mx-2 flex items-center gap-1" role="group" aria-label="Problem navigation">
          {nav.prev ? <Link href={link(nav.prev)} className={`${arrow} hover:bg-raised`} aria-label="Previous problem"><ChevronLeft size={16} /></Link>
            : <span className={`${arrow} opacity-40`} aria-disabled="true"><ChevronLeft size={16} /></span>}
          {nav.found && <span className="px-1 text-xs text-muted">{nav.index} of {nav.total}</span>}
          {nav.next ? <Link href={link(nav.next)} className={`${arrow} hover:bg-raised`} aria-label="Next problem"><ChevronRight size={16} /></Link>
            : <span className={`${arrow} opacity-40`} aria-disabled="true"><ChevronRight size={16} /></span>}
        </div>
        <QuickPick kind="random" qs={buildQS({ ...activeFilters, exclude: slug })} className="h-8 px-2.5 text-xs" />
        <QuickPick kind="daily" className="h-8 px-2.5 text-xs" />
        <div className="ml-auto"><BookmarkButton slug={slug} initial={marks.bookmarked.has(String(problem._id))} loggedIn={!!user} /></div>
      </div>
      {!judgeConfigured() && (
        <p className="border-b border-line bg-raised px-3 py-1.5 text-xs text-muted">Code execution needs setup: add JUDGE0_URL to .env.local. Until then, Run and Submit will report that the judge is not configured.</p>
      )}
      <ProblemWorkspace slug={slug} snippets={snippets} drafts={JSON.parse(JSON.stringify(drafts))} exampleInput={problem.exampleTestcases || ""} loggedIn={!!user}>
        <ProblemDescription problem={plain} warning={warning} />
      </ProblemWorkspace>
    </main>
  );
}
