"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { sendCustomRequest, type InboundState } from "@/app/(store)/inbound-actions";
import { PIECE_TYPES, FINISHES, BUDGETS } from "@/lib/custom-request";
import { useToast } from "@/components/ui/toast";
import { ReferencePhotos } from "@/components/reference-photos";

const field =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.2)]";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted";

const initial: InboundState = {};

// Note: <select> only reads defaultValue when it mounts, so each select is keyed
// on its saved value — after a validation error it remounts with the choice kept.
export function CustomDesignForm({ whatsappUrl }: { whatsappUrl?: string }) {
  const [state, formAction, pending] = useActionState(sendCustomRequest, initial);
  const toast = useToast();
  const v = state.values ?? {};

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success("We'll contact you within 1–2 working days.", { title: "Request received" });
  }, [state, toast]);

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-gold/40 bg-gold/5 px-6 py-12 text-center">
        <h3 className="font-serif text-2xl font-semibold text-ink">Thank you — your design request is in!</h3>
        <p className="mx-auto mt-2 max-w-md text-muted">
          Our team will review your idea and contact you within 1–2 working days with design options and a
          price.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full border border-[var(--line-strong)] px-7 py-2.5 text-sm font-medium text-ink transition hover:border-gold hover:text-gold-deep"
        >
          Browse the collection meanwhile
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {/* Honeypot for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="cd-name" className={labelCls}>Your name</label>
          <input id="cd-name" name="name" required autoComplete="name" defaultValue={v.name} className={field} />
        </div>
        <div>
          <label htmlFor="cd-email" className={labelCls}>Email</label>
          <input id="cd-email" name="email" type="email" required autoComplete="email" defaultValue={v.email} className={field} />
        </div>
        <div>
          <label htmlFor="cd-phone" className={labelCls}>Phone / WhatsApp</label>
          <input id="cd-phone" name="phone" type="tel" required autoComplete="tel" placeholder="03xx xxxxxxx" defaultValue={v.phone} className={field} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="cd-piece" className={labelCls}>What should we make?</label>
          <select id="cd-piece" key={`pieceType-${v.pieceType ?? ""}`} name="pieceType" required defaultValue={v.pieceType ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {PIECE_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cd-finish" className={labelCls}>Finish</label>
          <select id="cd-finish" key={`finish-${v.finish ?? ""}`} name="finish" required defaultValue={v.finish ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {FINISHES.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="cd-budget" className={labelCls}>Budget</label>
          <select id="cd-budget" key={`budget-${v.budget ?? ""}`} name="budget" required defaultValue={v.budget ?? ""} className={field}>
            <option value="" disabled>Choose…</option>
            {BUDGETS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="cd-needed" className={labelCls}>Needed by (optional)</label>
        <input id="cd-needed" name="neededBy" placeholder="e.g. Wedding on 15 December, or flexible" defaultValue={v.neededBy} className={field} />
      </div>

      <div>
        <label htmlFor="cd-details" className={labelCls}>Describe your design</label>
        <textarea
          id="cd-details"
          name="details"
          required
          rows={5}
          defaultValue={v.details}
          placeholder="Names or initials to engrave, ring size or chain length, stones, style you like, the occasion…"
          className={field}
        />
      </div>

      <ReferencePhotos resyncKey={state} whatsappUrl={whatsappUrl} />

      {state.error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">No payment now — we&apos;ll share designs and a price first.</p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon px-9 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-light transition hover:bg-maroon-2 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send Design Request"}
        </button>
      </div>
    </form>
  );
}
