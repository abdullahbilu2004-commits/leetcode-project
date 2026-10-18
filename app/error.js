"use client";
import { AlertTriangle } from "lucide-react";
export default function Error({ reset }) {
  return (
    <main className="mx-auto max-w-md px-4 py-24 text-center">
      <AlertTriangle className="mx-auto text-hard" />
      <h1 className="mt-3 text-lg font-semibold">Something went wrong</h1>
      <p className="mt-1 text-sm text-muted">The page could not load. If this keeps happening, check that MONGODB_URI and AUTH_SECRET are set and the database is reachable.</p>
      <button onClick={reset} className="mt-5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg">Try again</button>
    </main>
  );
}
