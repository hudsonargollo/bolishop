import type { ReactNode } from "react";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";

type Props = {
  children: ReactNode;
  /** Where the "back" link goes. Defaults to the storefront home. */
  backHref?: string;
  /** Label for the back link. */
  backLabel?: string;
  /** Small eyebrow line under the wordmark (e.g. a tagline). */
  eyebrow?: string;
};

// Auth layout: an immersive deep-maroon stage with layered gold light and a
// thin gold frame, holding one premium floating cream card centered on top.
export function AuthShell({
  children,
  backHref = "/",
  backLabel = "Back to store",
  eyebrow = "Fine everyday jewellery",
}: Props) {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14"
      style={{ background: "linear-gradient(160deg, #24080f 0%, #3d1019 55%, #2a0b12 100%)" }}
    >
      {/* Layered gold light for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% -5%, rgba(214,178,104,0.18), transparent 70%), radial-gradient(50% 40% at 50% 105%, rgba(169,126,48,0.14), transparent 70%)",
        }}
      />
      {/* Faint brand watermark */}
      <Emblem
        size={520}
        diamond="transparent"
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 text-gold/[0.06]"
      />

      {/* Thin gold frame around the whole stage */}
      <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border border-[rgba(230,205,139,0.22)] sm:inset-6" />

      {/* Back link */}
      <Link
        href={backHref}
        className="group absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(230,205,139,0.3)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-cream/85 backdrop-blur transition hover:border-gold hover:text-gold sm:left-10 sm:top-10"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">‹</span>
        {backLabel}
      </Link>

      {/* Floating card */}
      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(230,205,139,0.5)] bg-cream p-8 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)] sm:p-10">
          {/* Inner gold hairline frame */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(169,126,48,0.28)]" />
          {/* Top accent bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="relative">
            <div className="flex flex-col items-center text-center">
              {/* Emblem in a gold-ringed badge */}
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(169,126,48,0.4)] bg-[radial-gradient(circle,rgba(214,178,104,0.16),transparent_70%)]">
                <Emblem size={38} className="text-gold-deep" />
              </span>
              <span className="gold-text mt-3 font-serif text-[1.7rem] font-bold tracking-[0.28em]">
                ZARIERA
              </span>
              {eyebrow && (
                <span className="mt-1 text-[0.62rem] uppercase tracking-[0.32em] text-muted">
                  {eyebrow}
                </span>
              )}
              {/* Divider with center diamond */}
              <span className="mt-5 flex w-28 items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(169,126,48,0.5)]" />
                <span className="h-1.5 w-1.5 rotate-45 bg-gold-deep" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(169,126,48,0.5)]" />
              </span>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
