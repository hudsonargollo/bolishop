import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpForm } from "@/components/auth/otp-form";
import { requireCustomer } from "@/lib/customer-auth";
import { getPending, maskEmail, resendWaitSeconds } from "@/lib/otp";
import { verifyEmailAction, resendEmailVerification } from "../../auth-actions";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };
export const dynamic = "force-dynamic";

// Email verification for an existing account (created before OTP, or at checkout).
export default async function VerifyEmailPage() {
  const session = await requireCustomer("/account");
  const pending = await getPending("verify");
  if (!pending || pending.email !== session.email.toLowerCase()) redirect("/account");
  const wait = await resendWaitSeconds(pending.email, "verify").catch(() => 0);

  return (
    <AuthShell backHref="/account" backLabel="Back to account">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Verify your email</h1>
      </div>
      <div className="mt-5">
        <OtpForm
          maskedEmail={maskEmail(pending.email)}
          verifyAction={verifyEmailAction}
          resendAction={resendEmailVerification}
          initialWait={wait}
          changeHref="/account"
          changeLabel="Back to my account"
        />
      </div>
    </AuthShell>
  );
}
