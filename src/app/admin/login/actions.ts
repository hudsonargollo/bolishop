"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/admin";
import { startSession, endSession } from "@/lib/auth";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
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
    return { error: "Invalid email or password." };
  }

  await startSession(key, res.role);
  redirect("/admin?flash=admin-login");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
