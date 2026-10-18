"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const input = "mt-1 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm";

export default function AuthForm({ mode, next }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const signup = mode === "signup";
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/problems";

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    const body = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const res = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      toast.success(signup ? "Account created" : "Welcome back");
      router.push(safeNext);
      router.refresh();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border border-line bg-surface p-6">
      <h1 className="text-xl font-semibold">{signup ? "Create your account" : "Log in"}</h1>
      {signup && (
        <label className="block text-sm">Username
          <input name="username" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" autoComplete="username" className={input} />
        </label>
      )}
      <label className="block text-sm">Email
        <input name="email" type="email" required autoComplete="email" className={input} />
      </label>
      <label className="block text-sm">Password
        <input name="password" type="password" required minLength={signup ? 8 : 1} autoComplete={signup ? "new-password" : "current-password"} className={input} />
        {signup && <span className="mt-1 block text-xs text-muted">At least 8 characters.</span>}
      </label>
      {error && <p role="alert" className="text-sm text-hard">{error}</p>}
      <button disabled={busy} className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60">
        {busy && <Loader2 size={15} className="animate-spin" />}{signup ? "Create account" : "Log in"}
      </button>
      <p className="text-center text-sm text-muted">
        {signup ? "Already have an account? " : "New here? "}
        <Link href={signup ? "/login" : "/signup"} className="text-accent hover:underline">{signup ? "Log in" : "Create an account"}</Link>
      </p>
    </form>
  );
}
