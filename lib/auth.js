import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const COOKIE = "session";
const MAX_AGE = 60 * 60 * 24 * 7;
const key = () => {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function createSession(userId) {
  const token = await new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    await connectDB();
    return await User.findById(payload.sub).select("-passwordHash").lean();
  } catch {
    return null;
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status });
}
export function apiError(message, status = 400) {
  return Response.json({ error: message }, { status });
}
