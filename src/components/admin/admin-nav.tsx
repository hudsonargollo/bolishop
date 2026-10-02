"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function GridIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 4h7l9 9-7 7-9-9V4z" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M6 8h12l-1 12H7L6 8z" strokeLinejoin="round" />
      <path d="M9 8a3 3 0 0 1 6 0" strokeLinecap="round" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12l9 5 9-5M3 16l9 5 9-5" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      <path d="M16 4.5a3 3 0 0 1 0 6M17 15c2.5.4 4 2 4 5" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5" />
      <path d="M4 15l4-4 4 3 7-7" />
      <path d="M16 7h4v4" />
    </svg>
  );
}
function SparkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.2L12 3z" />
      <path d="M18.5 15.5l.7 1.9 1.8.6-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.6.7-1.9z" />
    </svg>
  );
}
function GaugeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15a8 8 0 0 1 16 0" />
      <path d="M12 15l4-3" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

export const ADMIN_LINKS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Dashboard", href: "/admin", icon: <GridIcon /> },
  { label: "Analytics", href: "/admin/analytics", icon: <ChartIcon /> },
  { label: "Insights", href: "/admin/insights", icon: <SparkIcon /> },
  { label: "Performance", href: "/admin/performance", icon: <GaugeIcon /> },
  { label: "Orders", href: "/admin/orders", icon: <BagIcon /> },
  { label: "Products", href: "/admin/products", icon: <TagIcon /> },
  { label: "Categories", href: "/admin/categories", icon: <LayersIcon /> },
  { label: "Customers", href: "/admin/customers", icon: <UsersIcon /> },
  { label: "Messages", href: "/admin/messages", icon: <InboxIcon /> },
];
const LINKS = ADMIN_LINKS;

export function AdminNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Fade labels; when expanding, wait for the width to grow before fading in.
  const labelStyle: React.CSSProperties = {
    transition: `opacity 180ms ease ${collapsed ? "0ms" : "130ms"}`,
  };

  return (
    <nav className="flex flex-col gap-1 p-3">
      {LINKS.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            title={collapsed ? l.label : undefined}
            aria-label={l.label}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-gold text-maroon" : "text-light/80 hover:bg-maroon-2 hover:text-gold"
            }`}
          >
            <span className="shrink-0">{l.icon}</span>
            <span
              style={labelStyle}
              className={`whitespace-nowrap ${collapsed ? "opacity-0" : "opacity-100"}`}
            >
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
