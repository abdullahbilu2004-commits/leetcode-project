import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import BookmarkButton from "@/components/BookmarkButton";

export default function ProblemCard({ p, href, solved, bookmarked, loggedIn }) {
  return (
    <article className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-accent/50">
      <div className="flex items-start justify-between gap-2">
        <Link href={href} className="font-medium hover:text-accent">
          <span className="mr-2 text-sm text-muted">{p.frontendId}.</span>{p.title}
        </Link>
        <BookmarkButton slug={p.slug} initial={bookmarked} loggedIn={loggedIn} />
      </div>
      <div className="flex items-center gap-2">
        <DifficultyBadge level={p.difficulty} />
        {p.isPaidOnly && <Lock size={13} className="text-muted" aria-label="Premium" />}
        {solved && <CheckCircle2 size={15} className="text-easy" aria-label="Solved" />}
      </div>
      <p className="line-clamp-1 text-xs text-muted">{(p.tags || []).join(", ") || "No tags"}</p>
    </article>
  );
}
