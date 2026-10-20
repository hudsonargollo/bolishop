import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { OtpForm } from "@/components/auth/otp-form";
import { getPending, maskEmail, resendWaitSeconds } from "@/lib/otp";
import { verifyRegistrationAction, resendRegistrationCode } from "../../auth-actions";

export const metadata: Metadata = { title: "Verify your email", robots: { index: false } };
export const dynamic = "force-dynamic";

// Step 2 of sign-up. The pending email comes from a signed httpOnly cookie set
// by the register form (never from the URL).
export default async function RegisterVerifyPage() {
  const pending = await getPending("register");
  if (!pending) redirect("/register");
  const wait = await resendWaitSeconds(pending.email, "register").catch(() => 0);

  return (
    <AuthShell backHref="/register" backLabel="Back">
      <div className="text-center">
        <span className="eyebrow">Step 2 of 2</span>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">Verify your email</h1>
      </div>
      <div className="mt-5">
        <OtpForm
          maskedEmail={maskEmail(pending.email)}
          verifyAction={verifyRegistrationAction}
          resendAction={resendRegistrationCode}
          initialWait={wait}
          changeHref="/register"
          changeLabel="Wrong email? Change it"
        />
      </div>
    </AuthShell>
  );
}
