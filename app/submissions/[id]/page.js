import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { requireUser } from "@/lib/requireUser";
import { connectDB } from "@/lib/db";
import Submission from "@/models/Submission";
import { LANGUAGES } from "@/lib/languages";
import { fmtDate } from "@/lib/format";
import StatusText from "@/components/StatusText";

export const metadata = { title: "Submission" };

export default async function SubmissionPage({ params }) {
  const { id } = await params;
  const user = await requireUser(`/submissions/${id}`);
  if (!mongoose.isValidObjectId(id)) notFound();
  await connectDB();
  const s = await Submission.findOne({ _id: id, user: user._id }).populate("problem", "slug title frontendId").lean();
  if (!s) notFound();
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/submissions" className="text-sm text-muted hover:text-fg">Back to submissions</Link>
      <h1 className="mt-3 text-xl font-semibold">{s.problem ? <Link href={`/problems/${s.problem.slug}`} className="hover:text-accent">{s.problem.frontendId}. {s.problem.title}</Link> : "Removed problem"}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
        <StatusText status={s.status} />
        <span>{LANGUAGES[s.language]?.label || s.language}</span>
        {s.total > 0 && <span>{s.passed}/{s.total} cases</span>}
        {s.timeMs != null && <span>{s.timeMs} ms</span>}
        {s.memoryKb ? <span>{(s.memoryKb / 1024).toFixed(1)} MB</span> : null}
        <span>{fmtDate(s.createdAt)}</span>
      </p>
      {!s.fullyVerified && <p className="mt-3 rounded-md border border-line bg-raised p-3 text-sm text-muted">This submission was not fully verified, so it did not mark the problem as solved.</p>}
      {s.error && <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-md border border-line bg-surface p-3 font-mono text-xs">{s.error}</pre>}
      <pre className="mt-4 overflow-x-auto rounded-lg border border-line bg-surface p-4 font-mono text-[13px] leading-6">{s.code}</pre>
    </main>
  );
}
