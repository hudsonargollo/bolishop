"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeaderCart } from "./cart/header-cart";
import { Emblem } from "./brand/emblem";
import { MobileMenu } from "./mobile-menu";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Collection", href: "/shop" },
  { label: "Custom", href: "/custom" },
  { label: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        {/* Brand */}
        <Link href="/" className="group flex shrink-0 items-center gap-2.5 text-gold-deep">
          <Emblem size={30} className="transition-transform duration-300 group-hover:scale-105" />
          <span className="flex flex-col leading-none">
            <span className="gold-text font-serif text-2xl font-bold tracking-[0.26em]">
              ZARIERA
            </span>
            <span className="mt-1 text-[0.5rem] uppercase tracking-[0.42em] text-muted">
              Every Jewel Tells a Story
            </span>
          </span>
        </Link>

        {/* Primary nav — animated gold underline */}
        <nav className="hidden items-center gap-8 md:flex">
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
                      : "text-ink/70 transition-colors group-hover:text-maroon"
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
        <div className="flex items-center gap-1 text-maroon">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-maroon/8 hover:text-gold-deep sm:flex"
          >
            <SearchIcon />
          </Link>
          <Link
            href="/account"
            aria-label="My account"
            className="hidden h-9 w-9 items-center justify-center rounded-full transition hover:bg-maroon/8 hover:text-gold-deep sm:flex"
          >
            <UserIcon />
          </Link>
          <div className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-maroon/8">
            <HeaderCart />
          </div>
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
