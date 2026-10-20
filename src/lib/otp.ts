import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { createToken, readToken, derivedKey } from "./session-token";
import { sendOtpEmail } from "./email";
import type { Prisma } from "@prisma/client";

// Email one-time codes (OTP) for sign-up and email verification.
//  - 6 digits from a CSPRNG, stored only as an HMAC (keyed from AUTH_SECRET).
//  - Expires after 10 minutes; 5 wrong attempts burn the code.
//  - Resend: 60 s cooldown, at most 5 codes per hour per email+purpose.
//  - The pending flow is tied to the browser with a short-lived signed,
//    httpOnly cookie, so the email never has to travel in the URL.

export type OtpPurpose = "register" | "verify";

export const OTP_LENGTH = 6;
const CODE_TTL_MS = 10 * 60_000;
const MAX_ATTEMPTS = 5;
export const RESEND_COOLDOWN_S = 60;
const MAX_SENDS_PER_HOUR = 5;
const PENDING_COOKIE = "zariera_verify";
const PENDING_TTL_S = 30 * 60;

type Pending = { email: string; purpose: OtpPurpose; exp: number };

function hashCode(email: string, purpose: OtpPurpose, code: string): string {
  return createHmac("sha256", derivedKey("otp")).update(`${purpose}:${email}:${code}`).digest("hex");
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return email;
  const shown = user.length <= 2 ? user[0] : user.slice(0, 2);
  return `${shown}${"•".repeat(Math.max(2, Math.min(6, user.length - shown.length)))}@${domain}`;
}

// ---------- pending cookie ----------

export async function setPending(email: string, purpose: OtpPurpose) {
  const store = await cookies();
  store.set(PENDING_COOKIE, createToken<Pending>("verify", { email, purpose, exp: Math.floor(Date.now() / 1000) + PENDING_TTL_S }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_TTL_S,
  });
}

export async function getPending(purpose: OtpPurpose): Promise<Pending | null> {
  const store = await cookies();
  const token = store.get(PENDING_COOKIE)?.value;
  const p = token ? readToken<Pending>("verify", token) : null;
  return p && p.purpose === purpose ? p : null;
}

export async function clearPending() {
  const store = await cookies();
  store.delete(PENDING_COOKIE);
}

// ---------- issue / verify ----------

export type IssueResult = { ok: true } | { ok: false; error: string; retryAfter?: number };

/** Creates (or replaces) a code for email+purpose and emails it. */
export async function issueCode(
  email: string,
  purpose: OtpPurpose,
  payload?: Prisma.InputJsonValue
): Promise<IssueResult> {
  const now = Date.now();
  const existing = await prisma.emailVerification.findUnique({ where: { email_purpose: { email, purpose } } });

  if (existing) {
    const since = (now - existing.lastSentAt.getTime()) / 1000;
    if (since < RESEND_COOLDOWN_S) {
      const wait = Math.ceil(RESEND_COOLDOWN_S - since);
      return { ok: false, error: `Please wait ${wait}s before requesting a new code.`, retryAfter: wait };
    }
    const withinHour = now - existing.createdAt.getTime() < 60 * 60_000;
    if (withinHour && existing.sendCount >= MAX_SENDS_PER_HOUR) {
      return { ok: false, error: "Too many codes requested. Please try again in an hour." };
    }
  }

  const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  const data = {
    codeHash: hashCode(email, purpose, code),
    attempts: 0,
    lastSentAt: new Date(now),
    expiresAt: new Date(now + CODE_TTL_MS),
    ...(payload !== undefined ? { payload } : {}),
  };

  const sent = await sendOtpEmail(email, code, purpose);
  if (!sent.ok) return { ok: false, error: sent.error };

  const resetWindow = !existing || now - existing.createdAt.getTime() >= 60 * 60_000;
  await prisma.emailVerification.upsert({
    where: { email_purpose: { email, purpose } },
    create: { email, purpose, ...data },
    update: resetWindow
      ? { ...data, sendCount: 1, createdAt: new Date(now) }
      : { ...data, sendCount: { increment: 1 } },
  });
  return { ok: true };
}

export type VerifyResult =
  | { ok: true; payload: Prisma.JsonValue | null }
  | { ok: false; error: string; reason: "invalid" | "expired" | "locked" | "missing" };

/** Checks a code. On success the code is consumed and its payload returned. */
export async function verifyCode(email: string, purpose: OtpPurpose, code: string): Promise<VerifyResult> {
  const rec = await prisma.emailVerification.findUnique({ where: { email_purpose: { email, purpose } } });
  if (!rec) return { ok: false, reason: "missing", error: "No code found — please request a new one." };
  if (rec.expiresAt.getTime() < Date.now())
    return { ok: false, reason: "expired", error: "This code has expired. Tap “Resend code” to get a new one." };
  if (rec.attempts >= MAX_ATTEMPTS)
    return { ok: false, reason: "locked", error: "Too many incorrect attempts. Tap “Resend code” to get a new one." };

  const clean = code.replace(/\D/g, "");
  const a = Buffer.from(hashCode(email, purpose, clean));
  const b = Buffer.from(rec.codeHash);
  const match = clean.length === OTP_LENGTH && a.length === b.length && timingSafeEqual(a, b);

  if (!match) {
    const updated = await prisma.emailVerification.update({
      where: { id: rec.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    const left = MAX_ATTEMPTS - updated.attempts;
    return left > 0
      ? { ok: false, reason: "invalid", error: `Incorrect code. ${left} attempt${left === 1 ? "" : "s"} left.` }
      : { ok: false, reason: "locked", error: "Too many incorrect attempts. Tap “Resend code” to get a new one." };
  }

  await prisma.emailVerification.delete({ where: { id: rec.id } });
  return { ok: true, payload: rec.payload };
}

/** Seconds until "Resend" is allowed (for the countdown on the page). */
export async function resendWaitSeconds(email: string, purpose: OtpPurpose): Promise<number> {
  const rec = await prisma.emailVerification.findUnique({
    where: { email_purpose: { email, purpose } },
    select: { lastSentAt: true },
  });
  if (!rec) return 0;
  return Math.max(0, Math.ceil(RESEND_COOLDOWN_S - (Date.now() - rec.lastSentAt.getTime()) / 1000));
}
