import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createSession, json, apiError } from "@/lib/auth";
import User from "@/models/User";

const schema = z.object({
  username: z.string().trim().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(req) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return apiError("Invalid username, email, or password (min 8 chars).");
  const { username, email, password } = parsed.data;
  try {
    await connectDB();
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, passwordHash });
    await createSession(user._id);
    return json({ user: { id: user._id, username, email } }, 201);
  } catch (e) {
    if (e?.code === 11000) return apiError("Username or email already in use.", 409);
    return apiError("Signup failed.", 500);
  }
}
