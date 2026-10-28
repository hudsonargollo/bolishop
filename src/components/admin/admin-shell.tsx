"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { AdminNav } from "./admin-nav";
import { AdminMobileNav } from "./admin-mobile-nav";
import { OrderNotifications } from "./order-notifications";
import { logoutAction } from "@/app/[tenant]/admin/login/actions";

const STORAGE_KEY = "zariera-admin-collapsed";

// Sidebar collapsed state persisted in localStorage (tiny external store).
const collapseListeners = new Set<() => void>();
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function writeCollapsed(v: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
  } catch {
    /* ignore */
  }
  collapseListeners.forEach((l) => l());
}
function subscribeCollapsed(l: () => void) {
  collapseListeners.add(l);
  return () => collapseListeners.delete(l);
}

export function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  // `ready` gates the width transition so the saved state applies instantly on
  // load (no animate-on-refresh); transitions only kick in for real toggles.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // enable transitions on the next frames, after the saved width is applied
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(r);
  }, []);

  const toggle = () => writeCollapsed(!collapsed);

  // Fade labels; when expanding, delay so they appear after the width has grown.
  const labelStyle: React.CSSProperties = {
    transition: `opacity 180ms ease ${collapsed ? "0ms" : "130ms"}`,
  };
  const labelCls = `whitespace-nowrap ${collapsed ? "opacity-0" : "opacity-100"}`;

  return (
    // Full-height app frame — nothing scrolls here; the two panes scroll on their own.
    <div style={{ height: "100dvh" }} className="flex overflow-hidden bg-cream">
      {/* ── Sidebar (desktop) ── */}
      <aside
        style={{
          width: collapsed ? 76 : 240,
          transition: ready ? "width 300ms cubic-bezier(0.4, 0, 0.2, 1)" : undefined,
        }}
        className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-[var(--line)] bg-maroon text-light md:flex"
      >
        {/* Brand */}
        <Link
          href="/admin"
          style={{ height: 64 }}
          className="flex shrink-0 items-center gap-3 border-b border-[rgba(230,205,139,0.2)] px-6"
        >
          <Emblem size={24} className="shrink-0 text-gold" />
          <span
            style={labelStyle}
            className={`gold-text font-serif text-lg font-bold tracking-[0.2em] ${labelCls}`}
          >
            ZARIERA
          </span>
        </Link>

        {/* Nav — scrolls vertically, clips labels horizontally */}
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <AdminNav collapsed={collapsed} />
        </div>

        {/* Footer — consistent icon+label rows so nothing jumps on collapse */}
        <div className="shrink-0 border-t border-[rgba(230,205,139,0.2)] p-3">
          <p
            style={labelStyle}
            className={`truncate px-3 pb-1.5 text-xs text-light/50 ${collapsed ? "opacity-0" : "opacity-100"}`}
          >
            {email}
          </p>
          <form action={logoutAction}>
            <button
              title={collapsed ? "Sign out" : undefined}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-light/80 transition-colors hover:bg-maroon-2 hover:text-gold"
            >
              <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M15 12H4M9 7l-5 5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 4h6a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={labelStyle} className={labelCls}>
                Sign out
              </span>
            </button>
          </form>
          <Link
            href="/"
            title={collapsed ? "View store" : undefined}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-light/60 transition-colors hover:text-gold"
          >
            <svg className="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M3 11l9-7 9 7M5 10v9h14v-9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={labelStyle} className={labelCls}>
              View store
            </span>
          </Link>
        </div>
      </aside>

      {/* ── Content column ── */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* Top bar (fixed height) */}
        <header
          style={{ height: 64 }}
          className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] bg-maroon px-4 text-light"
        >
          <div className="flex items-center gap-2">
            {/* Desktop sidebar toggle — clear, always visible */}
            <button
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand menu" : "Collapse menu"}
              className="hidden h-9 w-9 items-center justify-center rounded-md text-light/85 transition-colors hover:bg-maroon-2 hover:text-gold md:flex"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <line x1="9" y1="4" x2="9" y2="20" />
                <path
                  d={collapsed ? "M13.5 9.5l2.5 2.5-2.5 2.5" : "M16.5 9.5L14 12l2.5 2.5"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {/* Mobile brand */}
            <Link
              href="/admin"
              className="gold-text font-serif text-lg font-bold tracking-[0.2em] md:hidden"
            >
              ZARIERA
            </Link>
          </div>

          <div className="flex items-center gap-3 text-sm sm:gap-4">
            <OrderNotifications />
            <Link href="/" className="text-light/70 transition-colors hover:text-gold md:hidden">
              View store
            </Link>
            <form action={logoutAction} className="md:hidden">
              <button className="text-light/80 transition-colors hover:text-gold">Sign out</button>
            </form>
          </div>
        </header>

        {/* Mobile nav (fixed height) */}
        <div className="shrink-0">
          <AdminMobileNav />
        </div>

        {/* Scrollable content — this pane scrolls, the sidebar does not */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div style={{ maxWidth: 1600 }} className="mx-auto w-full px-5 py-8 sm:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
