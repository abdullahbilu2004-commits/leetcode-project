import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

// Use at the top of every private page. Redirects to login and returns here afterwards.
export async function requireUser(nextPath) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}
