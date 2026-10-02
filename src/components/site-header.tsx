"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderCart } from "./cart/header-cart";
import { Emblem } from "./brand/emblem";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Collection", href: "/shop" },
  { label: "Custom", href: "/custom" },
  { label: "Contact", href: "/contact" },
];

// Shared style for the header's circular icon buttons
const iconBtn =
  "relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-surface/60 text-maroon transition hover:border-gold hover:bg-gold/10 hover:text-gold-deep dark:text-ink";

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-10">
        {/* Brand */}
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2 text-gold-deep sm:gap-2.5 lg:shrink-0 lg:justify-self-start">
          <Emblem size={28} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span className="flex min-w-0 flex-col leading-none">
            <span className="gold-text truncate font-serif text-lg font-bold tracking-[0.2em] sm:text-2xl sm:tracking-[0.26em]">
              ZARIERA
            </span>
            <span className="mt-1 hidden truncate text-[0.5rem] uppercase tracking-[0.32em] text-muted sm:block sm:tracking-[0.42em]">
              Every Jewel Tells a Story
            </span>
          </span>
        </Link>

        {/* Primary nav — animated gold underline, centered */}
        <nav className="hidden items-center gap-8 lg:flex lg:justify-self-center">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative py-1 text-[0.8rem] font-medium uppercase tracking-[0.16em]"
              >
                <span
                  className={
                    active
                      ? "text-gold-deep"
                      : "text-ink/70 transition-colors group-hover:text-maroon dark:group-hover:text-gold"
                  }
                >
                  {item.label}
                </span>
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-gradient-to-r from-gold-hi to-gold-deep transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 text-maroon sm:gap-2 lg:justify-self-end">
          <Link href="/search" aria-label="Search" className={`${iconBtn} hidden sm:flex`}>
            <SearchIcon />
          </Link>
          <Link href="/account" aria-label="My account" className={`${iconBtn} hidden sm:flex`}>
            <UserIcon />
          </Link>
          <ThemeToggle className={iconBtn} />
          <HeaderCart className={iconBtn} />
          <MobileMenu />
        </div>
      </div>

      {/* Premium gold hairline accent */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(169,126,48,0.5)] to-transparent" />
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  );
}
