import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import BookmarkButton from "@/components/BookmarkButton";

export default function ProblemRow({ p, href, solved, bookmarked, loggedIn }) {
  return (
    <tr className="border-t border-line transition-colors hover:bg-raised/60">
      <td className="w-10 py-3 pl-4">{solved && <CheckCircle2 size={16} className="text-easy" aria-label="Solved" />}</td>
      <td className="w-14 py-3 text-sm text-muted">{p.frontendId}</td>
      <td className="py-3 pr-3">
        <Link href={href} className="font-medium hover:text-accent">{p.title}</Link>
        {p.isPaidOnly && <Lock size={12} className="ml-2 inline text-muted" aria-label="Premium" />}
      </td>
      <td className="py-3 pr-3"><DifficultyBadge level={p.difficulty} /></td>
      <td className="hidden py-3 pr-3 text-xs text-muted md:table-cell">{(p.tags || []).slice(0, 3).join(", ")}</td>
      <td className="w-12 py-3 pr-3"><BookmarkButton slug={p.slug} initial={bookmarked} loggedIn={loggedIn} /></td>
    </tr>
  );
}
