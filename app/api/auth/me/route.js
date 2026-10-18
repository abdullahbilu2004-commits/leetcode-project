import { getCurrentUser, json, apiError } from "@/lib/auth";
export async function GET() {
  const user = await getCurrentUser();
  return user ? json({ user }) : apiError("Not authenticated.", 401);
}
