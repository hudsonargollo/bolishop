"use client";

import { useActionState, useEffect } from "react";
import { bookShipmentAction } from "@/app/[tenant]/admin/(dashboard)/orders/actions";
import { useToast } from "@/components/ui/toast";

export function ShipmentPanel({
  id,
  booked,
  courierName,
  trackingNumber,
  trackUrl,
}: {
  id: string;
  booked: boolean;
  courierName?: string;
  trackingNumber?: string | null;
  trackUrl?: string;
}) {
  const [state, action, pending] = useActionState(bookShipmentAction.bind(null, id), {});
  const toast = useToast();

  useEffect(() => {
    if (state.ok) {
      toast.success(
        state.simulated
          ? "Shipment booked in test mode (add courier API keys for live booking)."
          : "Shipment booked — tracking number generated.",
        { title: "Shipment booked" }
      );
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, toast]);

  if (booked) {
    return (
      <div className="rounded-xl border border-[var(--line)] bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink">Shipping</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Booked
          </span>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted">Courier</dt>
            <dd className="text-ink">{courierName}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-24 shrink-0 text-muted">Tracking #</dt>
            <dd className="font-medium text-ink">{trackingNumber}</dd>
          </div>
        </dl>
        <a
          href={trackUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm text-ink transition hover:border-gold hover:text-gold-deep"
        >
          Track shipment
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7 17L17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--line)] bg-surface p-5">
      <h2 className="mb-1 font-serif text-lg font-semibold text-ink">Shipping</h2>
      <p className="mb-3 text-sm text-muted">Book this order with a courier.</p>
      <form action={action} className="space-y-3">
        <select
          name="courier"
          defaultValue=""
          required
          className="w-full rounded-lg border border-[var(--line-strong)] bg-cream px-3 py-2 text-sm text-ink outline-none focus:border-gold"
        >
          <option value="" disabled>
            Choose courier…
          </option>
          <option value="LEOPARDS">Leopards Courier</option>
          <option value="TCS">TCS</option>
        </select>
        <button
          disabled={pending}
          className="w-full rounded-lg bg-maroon px-4 py-2.5 text-sm font-medium text-light transition hover:bg-maroon-2 disabled:opacity-60"
        >
          {pending ? "Booking…" : "Book shipment"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state.ok && state.simulated && (
        <p className="mt-2 text-xs text-amber-700">
          Booked in test mode. Add the courier API keys to enable live booking.
        </p>
      )}
    </div>
  );
}
