"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";

// Hides the store footer on the auth screens (login / register) so they read
// as clean full-screen pages.
const HIDDEN_ON = ["/login", "/register"];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return <SiteFooter />;
}
