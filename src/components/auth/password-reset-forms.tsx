"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/app/(store)/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/ui/toast";

const initial: AuthState = {};

const input =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.22)]";

const label = "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted";

const submitBtn =
  "w-full rounded-full bg-maroon px-6 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-light shadow-[0_14px_34px_-14px_rgba(91,26,43,0.7)] transition hover:bg-maroon-2 disabled:opacity-60";

const errorBox = "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state, toast]);

  return (
    <AuthShell backHref="/login" backLabel="Back to sign in">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Forgot password</h1>
        <p className="mt-1 text-sm text-muted">We&apos;ll email you a link to choose a new one.</p>
      </div>

      {state.ok ? (
        <p className="mt-7 rounded-md border border-gold/40 bg-gold/5 px-4 py-3 text-center text-sm text-ink">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="mt-7 space-y-4">
          <div>
            <label className={label}>Email</label>
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={input} />
          </div>
          {state.error && <p className={errorBox}>{state.error}</p>}
          <button type="submit" disabled={pending} className={submitBtn}>
            {pending ? "Sending…" : "Send Reset Link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-gold-deep hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state, toast]);

  return (
    <AuthShell backHref="/login" backLabel="Back to sign in">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted">You&apos;ll be signed in right after.</p>
      </div>

      {token ? (
        <form action={formAction} className="mt-7 space-y-4">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className={label}>New password</label>
            <PasswordInput name="password" required minLength={8} autoComplete="new-password" className={input} />
            <p className="mt-1 text-xs text-muted">At least 8 characters</p>
          </div>
          {state.error && <p className={errorBox}>{state.error}</p>}
          <button type="submit" disabled={pending} className={submitBtn}>
            {pending ? "Saving…" : "Update Password"}
          </button>
        </form>
      ) : (
        <p className={`mt-7 ${errorBox}`}>
          This reset link is incomplete.{" "}
          <Link href="/forgot-password" className="underline">
            Request a new one
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
