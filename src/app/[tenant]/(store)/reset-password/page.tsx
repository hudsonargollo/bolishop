import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/password-reset-forms";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/[tenant]/reset-password">) {
  const sp = await searchParams;
  const token = (Array.isArray(sp.token) ? sp.token[0] : sp.token) ?? "";
  return <ResetPasswordForm token={token} />;
}
