import Link from "next/link";
import { History } from "lucide-react";
import { requireUser } from "@/lib/requireUser";
import { listSubmissions } from "@/services/submissionService";
import { LANGUAGES } from "@/lib/languages";
import { fmtDate } from "@/lib/format";
import StatusText from "@/components/StatusText";
import Pagination from "@/components/Pagination";

export const metadata = { title: "Submissions" };

export default async function SubmissionsPage({ searchParams }) {
  const user = await requireUser("/submissions");
  const sp = await searchParams;
  const page = Math.max(1, parseInt(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1);
  const data = await listSubmissions(user._id, { page, limit: 20 });
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Submissions</h1>
      <p className="mt-1 text-sm text-muted">{data.total} total. Runs are not saved, only submissions.</p>
      {data.items.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line p-10 text-center">
          <History className="mx-auto text-muted" />
          <h2 className="mt-3 font-medium">No submissions yet</h2>
          <Link href="/problems" className="mt-2 inline-block text-sm text-accent hover:underline">Browse problems</Link>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted"><tr><th className="px-4 py-2.5">Problem</th><th>Status</th><th>Language</th><th>Time</th><th>Memory</th><th>Submitted</th></tr></thead>
            <tbody>
              {data.items.map((s) => (
                <tr key={String(s._id)} className="border-t border-line hover:bg-raised/60">
                  <td className="px-4 py-3"><Link href={`/submissions/${s._id}`} className="hover:text-accent">{s.problem ? `${s.problem.frontendId}. ${s.problem.title}` : "Removed problem"}</Link></td>
                  <td><StatusText status={s.status} /></td>
                  <td>{LANGUAGES[s.language]?.label || s.language}</td>
                  <td>{s.timeMs != null ? `${s.timeMs} ms` : "-"}</td>
                  <td>{s.memoryKb ? `${(s.memoryKb / 1024).toFixed(1)} MB` : "-"}</td>
                  <td className="whitespace-nowrap pr-4 text-xs text-muted">{fmtDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={data.page} pages={data.pages} params={{}} basePath="/submissions" />
    </main>
  );
}
