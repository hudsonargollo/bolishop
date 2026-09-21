"use server";

import { redirect } from "next/navigation";
import { verifyCredentials } from "@/lib/admin";
import { startSession, endSession } from "@/lib/auth";

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

  const res = await verifyCredentials(email, password);
  if (!res.ok) {
    return { error: "Invalid email or password." };
  }

  await startSession(email.trim().toLowerCase(), res.role);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}
