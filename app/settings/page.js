import { requireUser } from "@/lib/requireUser";
import SettingsForm from "@/components/SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const initial = { language: user.settings?.language || "javascript", fontSize: user.settings?.fontSize || 14, theme: user.settings?.theme || "dark" };
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Signed in as {user.username} ({user.email}).</p>
      <SettingsForm initial={initial} />
    </main>
  );
}
