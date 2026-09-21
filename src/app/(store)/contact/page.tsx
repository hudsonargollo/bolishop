"use client";

import { useState } from "react";
import { Emblem } from "@/components/brand/emblem";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={44} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-3 block">Get in touch</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">Contact</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Questions about an order, a custom piece, or anything else? We&apos;d love to hear
          from you.
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_260px]">
        {/* Form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-cream-soft p-10 text-center">
            <h2 className="font-serif text-2xl font-semibold text-ink">Thank you!</h2>
            <p className="mt-2 text-muted">Your message has been received. We&apos;ll reply shortly.</p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold"
              />
            </div>
            <input
              placeholder="Subject"
              className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
            <textarea
              required
              rows={5}
              placeholder="Your message"
              className="w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="rounded-full bg-maroon px-9 py-3 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2"
            >
              Send Message
            </button>
          </form>
        )}

        {/* Details */}
        <aside className="space-y-6 text-sm">
          <div>
            <h3 className="eyebrow mb-2">Email</h3>
            <p className="text-ink">hello@zariera.com</p>
          </div>
          <div>
            <h3 className="eyebrow mb-2">Phone</h3>
            <p className="text-ink">+92 300 0000000</p>
          </div>
          <div>
            <h3 className="eyebrow mb-2">Hours</h3>
            <p className="text-ink">Mon–Sat, 11am – 8pm</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
