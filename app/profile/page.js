import Link from "next/link";
import { requireUser } from "@/lib/requireUser";
import { getProfileStats } from "@/services/profileService";
import { fmtDate } from "@/lib/format";
import StatusText from "@/components/StatusText";

export const metadata = { title: "Profile" };
const bar = { Easy: "bg-easy", Medium: "bg-medium", Hard: "bg-hard" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const st = await getProfileStats(user._id);
  const cards = [["Solved", st.solvedTotal], ["Attempted", st.attempted], ["Submissions", st.submissions], ["Accepted", st.accepted]];
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold">{user.username}</h1>
      <p className="mt-1 text-sm text-muted">{user.email}. Joined {fmtDate(user.createdAt)}.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={label} className="rounded-lg border border-line bg-surface p-4">
            <div className="text-2xl font-semibold">{n}</div><div className="text-sm text-muted">{label}</div>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-line bg-surface p-5" aria-label="Progress by difficulty">
        <h2 className="font-medium">Progress by difficulty</h2>
        <div className="mt-4 space-y-4">
          {st.levels.map((l) => (
            <div key={l.level}>
              <div className="flex justify-between text-sm"><span>{l.level}</span><span className="text-muted">{l.solved} / {l.total}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-raised" role="progressbar" aria-label={`${l.level} solved`} aria-valuemin={0} aria-valuemax={l.total} aria-valuenow={l.solved}>
                <div className={`h-full ${bar[l.level]}`} style={{ width: l.total ? `${(l.solved / l.total) * 100}%` : 0 }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">A problem counts as solved only when a submission is Accepted against the server's configured test cases, including at least one hidden case.</p>
      </section>

      <section className="mt-8" aria-label="Recent activity">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent activity</h2>
          <Link href="/submissions" className="text-sm text-accent hover:underline">All submissions</Link>
        </div>
        {st.recent.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-line p-6 text-center text-sm text-muted">No submissions yet. <Link href="/problems" className="text-accent hover:underline">Pick a problem</Link> to get started.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
            {st.recent.map((s) => (
              <li key={String(s._id)} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <Link href={`/submissions/${s._id}`} className="hover:text-accent">{s.problem ? `${s.problem.frontendId}. ${s.problem.title}` : "Removed problem"}</Link>
                <span className="flex items-center gap-3"><StatusText status={s.status} /><span className="text-xs text-muted">{fmtDate(s.createdAt)}</span></span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-6 text-sm text-muted"><Link href="/bookmarks" className="text-accent hover:underline">{st.bookmarks} bookmarked</Link> problems.</p>
    </main>
  );
}
