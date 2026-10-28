"use client";

import { useActionState, useEffect } from "react";
import { sendContactMessage, type InboundState } from "@/app/[tenant]/(store)/inbound-actions";
import { useToast } from "@/components/ui/toast";

const field =
  "w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold";

const initial: InboundState = {};

export function ContactForm({ topic, defaultSubject }: { topic?: string; defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success("We'll get back to you soon.", { title: "Message sent" });
  }, [state, toast]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-cream-soft p-10 text-center">
        <h2 className="font-serif text-2xl font-semibold text-ink">Thank you!</h2>
        <p className="mt-2 text-muted">Your message has been received. We&apos;ll reply shortly.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {topic && <input type="hidden" name="topic" value={topic} />}
      {/* Honeypot for bots — hidden from people and screen readers */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" defaultValue={state.values?.name} required autoComplete="name" placeholder="Your name" aria-label="Your name" className={field} />
        <input name="email" defaultValue={state.values?.email} required type="email" autoComplete="email" placeholder="Your email" aria-label="Your email" className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="phone" defaultValue={state.values?.phone} type="tel" autoComplete="tel" placeholder="Phone (optional)" aria-label="Phone" className={field} />
        <input name="subject" defaultValue={state.values?.subject ?? defaultSubject} placeholder="Subject" aria-label="Subject" className={field} />
      </div>
      <textarea name="message" defaultValue={state.values?.message} required rows={5} placeholder="Your message" aria-label="Your message" className={field} />
      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-maroon px-9 py-3 text-sm font-medium uppercase tracking-[0.12em] text-light transition hover:bg-maroon-2 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
