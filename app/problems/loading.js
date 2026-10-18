export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <div className="skeleton h-8 w-40" />
      <div className="skeleton mt-4 h-9 w-full" />
      <div className="mt-5 space-y-2">{Array.from({ length: 10 }, (_, i) => <div key={i} className="skeleton h-12 w-full" />)}</div>
    </main>
  );
}
