"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { startCustomerSession, endCustomerSession } from "@/lib/customer-auth";

export type AuthState = { error?: string };

const registerSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, email, password } = parsed.data;
  const e = email.trim().toLowerCase();

  let created;
  try {
    const existing = await prisma.customer.findUnique({ where: { email: e } });
    if (existing) return { error: "An account with this email already exists. Please sign in." };
    created = await prisma.customer.create({
      data: { name: name.trim(), email: e, passwordHash: hashPassword(password) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/connect|ECONNREFUSED|P1001|P1000/i.test(msg)) {
      return { error: "Service unavailable. Please try again shortly." };
    }
    if (/Unique constraint|P2002/i.test(msg)) {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: "Could not create your account. Please try again." };
  }

  await startCustomerSession({ id: created.id, email: created.email, name: created.name });
  redirect("/account");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Please enter your email and password." };

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
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await endCustomerSession();
  redirect("/");
}
