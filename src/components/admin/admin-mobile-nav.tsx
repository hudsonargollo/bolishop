"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_LINKS } from "./admin-nav";

// Horizontal, scrollable nav for the admin panel on mobile (the sidebar is
// hidden below md, so this is how admins move between sections on a phone).
export function AdminMobileNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="flex gap-1.5 overflow-x-auto border-b border-[rgba(230,205,139,0.2)] bg-maroon px-3 py-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {ADMIN_LINKS.map((l) => {
        const active = isActive(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              active ? "bg-gold text-maroon" : "text-light/80 hover:text-gold"
            }`}
          >
            {l.icon}
            {l.label}
          </Link>
        );
      })}
    </div>
  );
}
