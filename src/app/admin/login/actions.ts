"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/admin";
import { startSession, endSession } from "@/lib/auth";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";

export type LoginState = { error?: string; values?: { email: string } };

export async function loginAction(prev: LoginState, formData: FormData): Promise<LoginState> {
  // Keep the email after a failed attempt (React 19 resets the form).
  return { ...(await login(prev, formData)), values: { email: String(formData.get("email") ?? "") } };
}

async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const key = email.trim().toLowerCase();
  if (!rateLimit(`admin-login:${await clientIp()}`, 10, 15 * 60_000) || !rateLimit(`admin-login:${key}`, 5, 15 * 60_000)) {
    return { error: TOO_MANY };
  }

  const res = await verifyCredentials(email, password);
  if (!res.ok) {
    return {
      error:
        res.reason === "db"
          ? "Can't reach the database right now, so you can't sign in. Please try again in a minute."
          : "Invalid email or password.",
    };
  }

  await startSession(key, res.role, res.ver);
  redirect("/admin?flash=admin-login");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
