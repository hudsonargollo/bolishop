"use client";

import { useActionState, useEffect } from "react";
import { loginAction, type LoginState } from "@/app/admin/login/actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useToast } from "@/components/ui/toast";

const initial: LoginState = {};

const input =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.22)]";

const label = "mb-1.5 block text-xs font-medium uppercase tracking-[0.12em] text-muted";

const submitBtn =
  "w-full rounded-full bg-maroon px-6 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-light shadow-[0_14px_34px_-14px_rgba(91,26,43,0.7)] transition hover:bg-maroon-2 disabled:opacity-60";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state, toast]);

  return (
    <AuthShell backHref="/" backLabel="Back to store" eyebrow="Management dashboard">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Admin Login</h1>
        <p className="mt-1 text-sm text-muted">Sign in to the management dashboard.</p>
      </div>

      <form action={formAction} className="mt-7 space-y-4">
        <div>
          <label className={label}>Email</label>
          <input name="email" type="email" required autoComplete="username" placeholder="you@example.com" defaultValue={state.values?.email} className={input} />
        </div>
        <div>
          <label className={label}>Password</label>
          <PasswordInput name="password" required autoComplete="current-password" className={input} />
        </div>

        {state.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}

        <button type="submit" disabled={pending} className={submitBtn}>
          {pending ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Authorized staff only · ZARIERA
      </p>
    </AuthShell>
  );
}
