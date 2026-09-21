"use client";

import { useState } from "react";
import { Emblem } from "./brand/emblem";

export function Newsletter() {
  const [sent, setSent] = useState(false);

  return (
    <section className="bg-panel px-5 py-20">
      {/* Premium maroon card floating on the light panel */}
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[rgba(230,205,139,0.5)] px-6 py-12 text-center shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)] sm:px-14 sm:py-14"
        style={{ background: "linear-gradient(160deg, #24080f 0%, #3d1019 55%, #2a0b12 100%)" }}
      >
        {/* gold glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 55% at 50% 0%, rgba(214,178,104,0.18), transparent 70%)",
          }}
        />
        {/* top accent + inner frame */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="pointer-events-none absolute inset-4 rounded-xl border border-[rgba(230,205,139,0.2)]" />
        {/* faint watermark */}
        <Emblem
          size={320}
          diamond="transparent"
          className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 text-gold/[0.06]"
        />

        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(169,126,48,0.45)] bg-[radial-gradient(circle,rgba(214,178,104,0.18),transparent_70%)]">
            <Emblem size={32} className="text-gold" />
          </span>
          <span className="mt-4 block text-xs font-medium uppercase tracking-[0.34em] text-gold">
            Newsletter
          </span>
          <h2 className="mt-2 font-serif text-3xl font-bold text-cream sm:text-4xl">
            Join the ZARIERA list
          </h2>
          <p className="mx-auto mt-3 max-w-md text-cream/70">
            Be first to know about new arrivals, exclusive offers and special deals.
          </p>

          {sent ? (
            <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2 rounded-full border border-[rgba(230,205,139,0.4)] bg-[rgba(255,255,255,0.05)] px-6 py-3.5 text-sm text-cream">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold-hi)" strokeWidth="2.4">
                <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Thank you for subscribing!
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                aria-label="Email address"
                className="w-full rounded-full border border-[rgba(230,205,139,0.35)] bg-[rgba(255,255,255,0.06)] px-5 py-3.5 text-sm text-cream outline-none transition placeholder:text-cream/50 focus:border-gold focus:bg-[rgba(255,255,255,0.1)]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gradient-to-r from-gold-hi to-gold px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-maroon transition hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-cream/45">No spam, just sparkle — unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
