"use client";

import { usePathname } from "next/navigation";
import { Marquee } from "./marquee";
import { SiteHeader } from "./site-header";

// Hides the marquee + store header on the auth screens (login / register) so
// they read as clean, immersive full-screen pages with their own back link.
const HIDDEN_ON = ["/login", "/register"];

export function ConditionalHeader() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return (
    <>
      <Marquee />
      <SiteHeader />
    </>
  );
}
