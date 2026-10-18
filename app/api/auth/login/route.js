import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createSession, json, apiError } from "@/lib/auth";
import User from "@/models/User";

const schema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) });

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid credentials.", 400);
  try {
    await connectDB();
    const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
    const ok = user && (await bcrypt.compare(parsed.data.password, user.passwordHash));
    if (!ok) return apiError("Invalid email or password.", 401);
    await createSession(user._id);
    return json({ user: { id: user._id, username: user.username, email: user.email } });
  } catch {
    return apiError("Login failed.", 500);
  }
}
