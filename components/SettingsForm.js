"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LANGUAGES, LANG_KEYS } from "@/lib/languages";

const field = "mt-1 h-10 w-full rounded-md border border-line bg-bg px-3 text-sm";
const primary = "h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:opacity-90 disabled:opacity-60";

export default function SettingsForm({ initial }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
    setSaving(false);
    if (!res.ok) return toast.error("Could not save settings.");
    try {
      localStorage.setItem("lang", s.language);
      localStorage.setItem("theme", s.theme);
      const prefs = JSON.parse(localStorage.getItem("editorPrefs") || "{}");
      localStorage.setItem("editorPrefs", JSON.stringify({ ...prefs, fontSize: s.fontSize }));
    } catch {}
    document.documentElement.dataset.theme = s.theme;
    toast.success("Settings saved");
    router.refresh();
  }
  async function changePassword(e) {
    e.preventDefault();
    const form = e.currentTarget;
    setPwBusy(true);
    const res = await fetch("/api/settings/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const data = await res.json().catch(() => ({}));
    setPwBusy(false);
    if (!res.ok) return toast.error(data.error || "Could not change password.");
    form.reset();
    toast.success("Password changed");
  }
  return (
    <div className="space-y-8">
      <form onSubmit={save} className="space-y-4 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-medium">Editor and appearance</h2>
        <label className="block text-sm">Default language
          <select className={field} value={s.language} onChange={(e) => setS({ ...s, language: e.target.value })}>{LANG_KEYS.map((k) => <option key={k} value={k}>{LANGUAGES[k].label}</option>)}</select></label>
        <label className="block text-sm">Editor font size
          <select className={field} value={s.fontSize} onChange={(e) => setS({ ...s, fontSize: +e.target.value })}>{[12, 13, 14, 16, 18, 20].map((n) => <option key={n}>{n}</option>)}</select></label>
        <label className="block text-sm">Theme
          <select className={field} value={s.theme} onChange={(e) => setS({ ...s, theme: e.target.value })}><option value="dark">Dark</option><option value="light">Light</option></select></label>
        <button className={primary} disabled={saving}>{saving ? "Saving..." : "Save settings"}</button>
      </form>
      <form onSubmit={changePassword} className="space-y-4 rounded-xl border border-line bg-surface p-6">
        <h2 className="font-medium">Change password</h2>
        <label className="block text-sm">Current password<input name="currentPassword" type="password" required autoComplete="current-password" className={field} /></label>
        <label className="block text-sm">New password<input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={field} /></label>
        <button className={primary} disabled={pwBusy}>{pwBusy ? "Updating..." : "Update password"}</button>
      </form>
    </div>
  );
}
