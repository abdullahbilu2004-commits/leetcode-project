"use client";
import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, List, Loader2, Search, X } from "lucide-react";
import { buildQS } from "@/lib/query";

const sel = "h-9 rounded-md border border-line bg-surface px-2 text-sm";

export default function ProblemFilters({ tags, loggedIn, params }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const [q, setQ] = useState(params.q || "");

  function push(next) {
    const qs = buildQS({ ...params, ...next, page: undefined });
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }
  useEffect(() => {
    if (q === (params.q || "")) return;
    const t = setTimeout(() => push({ q: q || undefined }), 350);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  const view = params.view === "cards" ? "cards" : "table";
  const hasFilters = ["q", "difficulty", "tag", "status"].some((k) => params[k]);
  return (
    <div className="flex flex-wrap items-center gap-2" role="search">
      <div className="relative min-w-56 flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title or ID" aria-label="Search problems"
          className="h-9 w-full rounded-md border border-line bg-surface pl-9 pr-3 text-sm placeholder:text-muted" />
      </div>
      <select aria-label="Difficulty" className={sel} value={params.difficulty || ""} onChange={(e) => push({ difficulty: e.target.value || undefined })}>
        <option value="">All difficulties</option><option>Easy</option><option>Medium</option><option>Hard</option>
      </select>
      <select aria-label="Topic" className={`${sel} max-w-44`} value={params.tag || ""} onChange={(e) => push({ tag: e.target.value || undefined })}>
        <option value="">All topics</option>
        {/* {tags.map((t) => <option key={t}>{t}</option>)} */}
        {[...new Set(tags.filter(Boolean))].map((t) => <option key={`tag-${t}`} value={t}>{t}</option>)}
      </select>
      <select aria-label="Status" className={sel} value={params.status || ""} disabled={!loggedIn}
        title={loggedIn ? undefined : "Log in to filter by status"} onChange={(e) => push({ status: e.target.value || undefined })}>
        <option value="">Any status</option><option value="solved">Solved</option><option value="unsolved">Unsolved</option><option value="bookmarked">Bookmarked</option>
      </select>
      <select aria-label="Sort by" className={sel} value={params.sort || "id"} onChange={(e) => push({ sort: e.target.value === "id" ? undefined : e.target.value })}>
        <option value="id">Sort: ID</option><option value="title">Sort: Title</option><option value="difficulty">Sort: Difficulty</option>
      </select>
      <select aria-label="Order" className={sel} value={params.order || "asc"} onChange={(e) => push({ order: e.target.value === "asc" ? undefined : e.target.value })}>
        <option value="asc">Ascending</option><option value="desc">Descending</option>
      </select>
      <div className="flex rounded-md border border-line" role="group" aria-label="View">
        {[["table", List, "Table view"], ["cards", LayoutGrid, "Card view"]].map(([v, Icon, label]) => (
          <button key={v} onClick={() => push({ view: v === "table" ? undefined : v })} aria-label={label} aria-pressed={view === v}
            className={`grid size-9 place-items-center ${view === v ? "bg-raised text-fg" : "text-muted"}`}><Icon size={15} /></button>
        ))}
      </div>
      {hasFilters && <Link href="/problems" className="flex h-9 items-center gap-1 rounded-md px-2 text-sm text-muted hover:text-fg"><X size={14} />Clear</Link>}
      {pending && <Loader2 size={16} className="animate-spin text-muted" aria-label="Loading" />}
    </div>
  );
}
