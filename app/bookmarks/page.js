import Link from "next/link";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { requireUser } from "@/lib/requireUser";
import { connectDB } from "@/lib/db";
import Bookmark from "@/models/Bookmark";
import { getUserMarks } from "@/services/userStateService";
import ProblemRow from "@/components/ProblemRow";

export const metadata = { title: "Bookmarks" };

export default async function BookmarksPage() {
  const user = await requireUser("/bookmarks");
  await connectDB();
  const marks = await Bookmark.find({ user: user._id }).sort({ createdAt: -1 }).limit(500)
    .populate("problem", "frontendId slug title difficulty tags isPaidOnly").lean();
  const problems = marks.map((m) => m.problem).filter(Boolean);
  const state = await getUserMarks(user._id, problems.map((p) => p._id));
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Bookmarks</h1>
      {problems.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-line p-10 text-center">
          <BookmarkIcon className="mx-auto text-muted" />
          <h2 className="mt-3 font-medium">Nothing bookmarked yet</h2>
          <p className="mt-1 text-sm text-muted">Use the bookmark icon on any problem to save it here.</p>
          <Link href="/problems" className="mt-3 inline-block text-sm text-accent hover:underline">Browse problems</Link>
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full text-left">
            <tbody>
              {problems.map((p) => (
                <ProblemRow key={p.slug} p={p} href={`/problems/${p.slug}`} loggedIn solved={state.solved.has(String(p._id))} bookmarked />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
