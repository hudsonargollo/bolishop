"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import type { StoreSettings } from "@/lib/settings-shared";

// Hides the store footer on the auth screens (login / register) so they read
// as clean full-screen pages.
const HIDDEN_ON = ["/login", "/register", "/register/verify", "/forgot-password", "/reset-password", "/account/verify-email"];

export function ConditionalFooter({ settings }: { settings: StoreSettings }) {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return <SiteFooter settings={settings} />;
}
