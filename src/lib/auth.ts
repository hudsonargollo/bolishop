import { cookies } from "next/headers";
import { timingSafeEqual, createHmac } from "node:crypto";

// Lightweight admin auth — no external dependencies.
// Passwords: scrypt salted hashes (see ./password). Sessions: HMAC-signed cookie.

export { hashPassword, verifyPassword } from "./password";

const SESSION_COOKIE = "zariera_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

// ---------- Session tokens ----------

export type AdminSession = { email: string; role: string; exp: number };

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function createToken(session: AdminSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string): AdminSession | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as AdminSession;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

// ---------- Cookie helpers (server actions / route handlers) ----------

export async function startSession(email: string, role: string): Promise<void> {
  const session: AdminSession = {
    email,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const store = await cookies();
  store.set(SESSION_COOKIE, createToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token ? readToken(token) : null;
}
