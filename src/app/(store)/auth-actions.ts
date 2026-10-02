"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword, MIN_PASSWORD } from "@/lib/password";
import { startCustomerSession, endCustomerSession, safeNext } from "@/lib/customer-auth";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { createToken, readToken } from "@/lib/session-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

export type AuthState = { error?: string; ok?: boolean; message?: string };

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  password: z
    .string()
    .min(MIN_PASSWORD, `Password must be at least ${MIN_PASSWORD} characters`)
    .max(200),
});

const MINUTE = 60_000;

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!rateLimit(`register:${await clientIp()}`, 5, 60 * MINUTE)) return { error: TOO_MANY };

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, email, password } = parsed.data;
  const e = email.toLowerCase();

  let created;
  try {
    created = await prisma.customer.create({
      data: { name, email: e, passwordHash: hashPassword(password) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/connect|ECONNREFUSED|P1001|P1000/i.test(msg)) {
      return { error: "Service unavailable. Please try again shortly." };
    }
    if (/Unique constraint|P2002/i.test(msg)) {
      return { error: "An account with this email already exists. Please sign in or reset your password." };
    }
    return { error: "Could not create your account. Please try again." };
  }

  await startCustomerSession({ id: created.id, email: created.email, name: created.name });
  redirect(withFlash(safeNext(formData.get("next")), "register"));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 20, 15 * MINUTE) || !rateLimit(`login:${email}`, 8, 15 * MINUTE)) {
    return { error: TOO_MANY };
  }

  let customer;
  try {
    customer = await prisma.customer.findUnique({ where: { email } });
  } catch {
    return { error: "Service unavailable. Please try again shortly." };
  }

  if (!customer || !verifyPassword(password, customer.passwordHash)) {
    return { error: "Invalid email or password." };
  }

  await startCustomerSession({ id: customer.id, email: customer.email, name: customer.name });
  redirect(withFlash(safeNext(formData.get("next")), "login"));
}

export async function logoutAction(): Promise<void> {
  await endCustomerSession();
  redirect("/?flash=signed-out");
}

// ---------- Password reset ----------
// Stateless signed link (1 hour). It embeds a fingerprint of the current
// password hash, so it stops working as soon as the password is changed —
// i.e. each link is single-use.

const RESET_TTL_SECONDS = 60 * 60;
type ResetToken = { id: string; v: string; exp: number };

function fingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
}

export async function requestPasswordResetAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email." };
  if (!rateLimit(`reset:${await clientIp()}`, 5, 30 * MINUTE) || !rateLimit(`reset:${email}`, 3, 30 * MINUTE)) {
    return { error: TOO_MANY };
  }

  // Same answer whether or not the account exists (no account enumeration).
  const done: AuthState = {
    ok: true,
    message: "If an account exists for that email, we've sent a link to reset your password.",
  };

  try {
    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) return done;
    const token = createToken<ResetToken>("reset", {
      id: customer.id,
      v: fingerprint(customer.passwordHash),
      exp: Math.floor(Date.now() / 1000) + RESET_TTL_SECONDS,
    });
    await sendPasswordResetEmail({
      to: customer.email,
      name: customer.name,
      url: `${siteUrl}/reset-password?token=${encodeURIComponent(token)}`,
    });
  } catch (err) {
    console.error("[auth] password reset request failed:", err);
  }
  return done;
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!rateLimit(`reset-submit:${await clientIp()}`, 10, 30 * MINUTE)) return { error: TOO_MANY };

  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < MIN_PASSWORD) {
    return { error: `Password must be at least ${MIN_PASSWORD} characters.` };
  }

  const data = readToken<ResetToken>("reset", token);
  const invalid = { error: "This reset link is invalid or has expired. Please request a new one." };
  if (!data) return invalid;

  let customer;
  try {
    customer = await prisma.customer.findUnique({ where: { id: data.id } });
    if (!customer || fingerprint(customer.passwordHash) !== data.v) return invalid;
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { passwordHash: hashPassword(password) },
    });
  } catch {
    return { error: "Service unavailable. Please try again shortly." };
  }

  await startCustomerSession({ id: customer.id, email: customer.email, name: customer.name });
  redirect("/account?flash=password-reset");
}

function withFlash(path: string, flash: string): string {
  return `${path}${path.includes("?") ? "&" : "?"}flash=${flash}`;
}
