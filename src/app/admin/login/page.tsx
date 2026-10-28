import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getVerifiedAdmin } from "@/lib/admin";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const SIGNED_OUT: Record<string, string> = {
  replaced: "You were signed out because this admin account was signed in on another device.",
  db: "You were signed out because the database couldn't be reached. Please sign in again.",
};

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  // Already signed in? Go straight to the dashboard.
  const session = await getVerifiedAdmin();
  if (session) redirect("/admin");

  const sp = await searchParams;
  const why = Array.isArray(sp.signed_out) ? sp.signed_out[0] : sp.signed_out;
  return <AdminLoginForm notice={why ? SIGNED_OUT[why] : undefined} />;
}
