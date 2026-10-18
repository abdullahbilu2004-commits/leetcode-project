"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CalendarDays, Loader2, Shuffle } from "lucide-react";

// kind: "random" | "daily". qs: optional filter query string so random respects current filters.
export default function QuickPick({ kind, qs = "", className = "" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const Icon = kind === "daily" ? CalendarDays : Shuffle;
  async function go() {
    setBusy(true);
    try {
      const res = await fetch(`/api/problems/${kind}${qs ? `?${qs}` : ""}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (kind === "daily" && data.source === "fallback") toast("LeetCode daily unavailable. Showing a local pick for today.");
      router.push(`/problems/${data.slug}`);
    } catch (e) {
      toast.error(e.message);
      setBusy(false);
    }
  }
  return (
    <button onClick={go} disabled={busy}
      className={`inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 text-sm transition-colors hover:bg-raised disabled:opacity-60 ${className}`}>
      {busy ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      {kind === "daily" ? "Daily challenge" : "Random problem"}
    </button>
  );
}
