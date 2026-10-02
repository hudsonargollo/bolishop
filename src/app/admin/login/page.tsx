import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getVerifiedAdmin } from "@/lib/admin";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  // Already signed in? Go straight to the dashboard.
  const session = await getVerifiedAdmin();
  if (session) redirect("/admin");

  return <AdminLoginForm />;
}
