import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getCurrentUser, json, apiError } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import User from "@/models/User";

const schema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(8).max(128) });

export async function POST(req) {
  const me = await getCurrentUser();
  if (!me) return apiError("Not authenticated.", 401);
  if (!rateLimit(`pw:${me._id}`, 5).ok) return apiError("Too many attempts. Wait a minute.", 429);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("The new password must be at least 8 characters.");
  await connectDB();
  const user = await User.findById(me._id);
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) return apiError("Current password is incorrect.", 403);
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  return json({ ok: true });
}
