import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual, createHmac } from "node:crypto";

// Storefront customer sessions — separate cookie from the admin session.
// HMAC-signed token, no external dependency.

const COOKIE = "zariera_customer";
const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.AUTH_SECRET || "dev-secret-change-me";
}

export type CustomerSession = {
  id: string;
  email: string;
  name: string;
  exp: number;
};

function sign(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

function createToken(session: CustomerSession): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string): CustomerSession | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as CustomerSession;
    if (session.exp < Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

export async function startCustomerSession(customer: {
  id: string;
  email: string;
  name: string;
}): Promise<void> {
  const session: CustomerSession = {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const store = await cookies();
  store.set(COOKIE, createToken(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function endCustomerSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  return token ? readToken(token) : null;
}

// Guards customer-only pages — redirects to login when not signed in.
export async function requireCustomer(): Promise<CustomerSession> {
  const session = await getCustomerSession();
  if (!session) redirect("/login");
  return session;
}
