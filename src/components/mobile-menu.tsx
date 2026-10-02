"use client";

import { useEffect, useState } from "react";
import { useMounted } from "@/lib/use-mounted";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "./cart/cart-provider";
import { Emblem } from "./brand/emblem";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Collection", href: "/shop" },
  { label: "Custom", href: "/custom" },
  { label: "Contact", href: "/contact" },
];

const HELP = [
  { label: "My Account", href: "/account" },
  { label: "Track Order", href: "/account/orders" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Care Guide", href: "/care" },
  { label: "FAQ", href: "/faq" },
];

export function MobileMenu() {
  const pathname = usePathname();
  // The menu remembers which page it was opened on, so navigating anywhere
  // closes it automatically (no effect needed).
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (v: boolean) => setOpenOn(v ? pathname : null);
  const mounted = useMounted();
  const { count, ready } = useCart();

  // Lock body scroll + close on Escape while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenOn(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="lg:hidden">
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center text-maroon transition hover:text-gold-deep dark:text-ink"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Overlay is portalled to <body> so it escapes the header's
          backdrop-filter containing block and covers the full viewport.
          The wrapper clips the off-screen drawer to avoid page overflow. */}
      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-50 overflow-hidden lg:hidden ${
              open ? "" : "pointer-events-none"
            }`}
          >
        {/* Backdrop */}
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        />

        {/* Drawer */}
        <aside
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-cream shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-maroon px-5 py-4">
          <span className="flex items-center gap-2 text-gold">
            <Emblem size={22} />
            <span className="gold-text font-serif text-lg font-bold tracking-[0.22em]">ZARIERA</span>
          </span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center text-light/80 transition hover:text-gold"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`border-b border-[var(--line)] py-3.5 font-serif text-xl transition ${
                  isActive(item.href) ? "text-gold-deep" : "text-ink hover:text-gold-deep"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Quick actions */}
          <div className="mt-6 flex gap-3">
            <Link
              href="/search"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] py-2.5 text-sm text-ink transition hover:border-gold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              Search
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] py-2.5 text-sm text-ink transition hover:border-gold"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
                <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
              </svg>
              Cart{ready && count > 0 ? ` (${count})` : ""}
            </Link>
          </div>

          {/* Help */}
          <h3 className="eyebrow mt-8 mb-2">Help</h3>
          <nav className="flex flex-col">
            {HELP.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted transition hover:text-gold-deep"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CTA footer */}
        <div className="border-t border-[var(--line)] p-5">
          <Link
            href="/shop"
            onClick={() => setOpen(false)}
            className="block rounded-full bg-maroon px-6 py-3 text-center text-sm font-medium uppercase tracking-[0.12em] text-light transition hover:bg-maroon-2"
          >
            Explore Collection
          </Link>
        </div>
          </aside>
          </div>,
          document.body
        )}
    </div>
  );
}
