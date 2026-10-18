import { z } from "zod";
import { connectDB } from "@/lib/db";
import { getCurrentUser, json, apiError } from "@/lib/auth";
import { LANG_KEYS } from "@/lib/languages";
import User from "@/models/User";

const schema = z.object({
  language: z.enum(LANG_KEYS),
  fontSize: z.number().int().min(10).max(28),
  theme: z.enum(["dark", "light"]),
});

export async function GET() {
  const user = await getCurrentUser();
  return user ? json({ settings: user.settings }) : apiError("Not authenticated.", 401);
}

export async function PUT(req) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", 401);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid settings.");
  await connectDB();
  await User.updateOne({ _id: user._id }, { $set: { settings: parsed.data } });
  return json({ settings: parsed.data });
}
