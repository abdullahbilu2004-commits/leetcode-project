import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page or problem you opened does not exist, or the problem has not been imported yet.</p>
      <Link href="/problems" className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg">Go to problems</Link>
    </main>
  );
}
