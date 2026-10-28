"use client";

import { usePathname } from "next/navigation";
import { Marquee } from "./marquee";
import { SiteHeader } from "./site-header";

// Hides the marquee + store header on the auth screens (login / register) so
// they read as clean, immersive full-screen pages with their own back link.
const HIDDEN_ON = ["/login", "/register", "/register/verify", "/forgot-password", "/reset-password", "/account/verify-email"];

export function ConditionalHeader({ announcements, tenant, currencySymbol }: { announcements: string[]; tenant?: { displayName?: string | null; tagline?: string | null; brandColor?: string | null }; currencySymbol?: string }) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return (
    <>
      <Marquee items={announcements} />
      <SiteHeader tenant={tenant} currencySymbol={currencySymbol} />
    </>
  );
}
