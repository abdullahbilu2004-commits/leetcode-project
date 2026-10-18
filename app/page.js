import Link from "next/link";
import { Bookmark, Code2, Search, ShieldCheck } from "lucide-react";
import { connectDB } from "@/lib/db";
import Problem from "@/models/Problem";
import QuickPick from "@/components/QuickPick";

async function getCount() {
  try { await connectDB(); return await Problem.estimatedDocumentCount(); } catch { return null; }
}

const features = [
  { Icon: Search, title: "Find the right problem", text: "Search by title or ID, then filter by difficulty, topic, and your own progress." },
  { Icon: Code2, title: "Write code in the browser", text: "A Monaco editor with JavaScript, Python, Java, and C++, and your drafts saved per problem." },
  { Icon: ShieldCheck, title: "Honest results", text: "A sample run is never reported as Accepted. Only the full test set can do that." },
  { Icon: Bookmark, title: "Keep track", text: "Bookmark problems and review your submission history and solved counts." },
];

export default async function Home() {
  const count = await getCount();
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">Practice coding problems the way you would in an interview.</h1>
          <p className="mt-5 max-w-md text-muted">
            Browse problems from LeetCode's public set, write a solution in the browser, and run it against a judge.
            {count ? ` ${count.toLocaleString()} problems are available right now.` : ""}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/problems" className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg hover:opacity-90">Browse problems</Link>
            <QuickPick kind="daily" />
          </div>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-line bg-surface p-5 font-mono text-[13px] leading-6" aria-hidden="true">
{`function binarySearch(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`}
        </pre>
      </section>
      <section className="grid gap-4 pb-20 sm:grid-cols-2">
        {features.map(({ Icon, title, text }) => (
          <div key={title} className="rounded-lg border border-line bg-surface p-5">
            <Icon size={18} className="text-accent" />
            <h2 className="mt-3 font-medium">{title}</h2>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
