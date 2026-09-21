"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthState } from "../auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";

const initial: AuthState = {};

const input =
  "w-full rounded-lg border border-[var(--line-strong)] bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.22)]";

const label = "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted";

const submitBtn =
  "w-full rounded-full bg-maroon px-6 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-cream shadow-[0_14px_34px_-14px_rgba(91,26,43,0.7)] transition hover:bg-maroon-2 disabled:opacity-60";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <AuthShell>
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Create account</h1>
        <p className="mt-1 text-sm text-muted">Join ZARIERA for a faster checkout.</p>
      </div>

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label className={label}>Full name</label>
          <input name="name" required autoComplete="name" placeholder="Your name" className={input} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={input} />
        </div>
        <div>
          <label className={label}>Password</label>
          <PasswordInput name="password" required autoComplete="new-password" className={input} />
          <p className="mt-1 text-xs text-muted">At least 6 characters</p>
        </div>

        {state.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button type="submit" disabled={pending} className={submitBtn}>
          {pending ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gold-deep hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
