"use client";

import { useActionState, useEffect } from "react";
import { subscribe, type InboundState } from "@/app/[tenant]/(store)/inbound-actions";
import { useToast } from "@/components/ui/toast";

const initial: InboundState = {};

// "Notify me" for an empty (coming soon) category — saves a Subscriber with
// source "notify:<slug>" so the owner can email them at launch.
export function NotifyForm({ slug, label }: { slug: string; label: string }) {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success(`We'll email you when ${label.toLowerCase()} launch.`, { title: "You're on the list" });
  }, [state, toast, label]);

  if (state.ok) {
    return <p className="text-sm text-gold-deep">Thanks! We&apos;ll let you know as soon as they&apos;re here.</p>;
  }

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input type="hidden" name="source" value={`notify:${slug}`} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input
        type="email"
        name="email"
        required
        placeholder="Your email"
        aria-label="Email address"
        className="w-full rounded-full border border-[var(--line-strong)] bg-cream-soft px-5 py-3 text-sm outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm text-ink transition hover:border-gold hover:text-gold-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Notify me"}
      </button>
    </form>
  );
}
