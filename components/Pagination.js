import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildQS } from "@/lib/query";

export default function Pagination({ page, pages, params, basePath = "/problems" }) {
  if (pages <= 1) return null;
  const href = (n) => `${basePath}?${buildQS({ ...params, page: n === 1 ? undefined : n })}`;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const base = "grid h-9 min-w-9 place-items-center rounded-md border border-line px-2 text-sm";
  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
      {page > 1 ? <Link href={href(page - 1)} className={`${base} hover:bg-raised`} aria-label="Previous page"><ChevronLeft size={16} /></Link>
        : <span className={`${base} opacity-40`}><ChevronLeft size={16} /></span>}
      {nums.map((n) => (
        <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined}
          className={`${base} ${n === page ? "border-accent bg-accent text-accent-fg" : "hover:bg-raised"}`}>{n}</Link>
      ))}
      {page < pages ? <Link href={href(page + 1)} className={`${base} hover:bg-raised`} aria-label="Next page"><ChevronRight size={16} /></Link>
        : <span className={`${base} opacity-40`}><ChevronRight size={16} /></span>}
    </nav>
  );
}
