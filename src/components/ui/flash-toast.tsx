"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast";

// Server actions can't fire client toasts, and successful auth/product actions
// end in a redirect. So they redirect with `?flash=<key>` and this component —
// mounted once at the root — shows the matching toast on the destination page,
// then strips the param. It watches pathname/searchParams (not just mount) so it
// fires on client-side navigations too, since the root layout never re-mounts.
const MESSAGES: Record<
  string,
  { variant: "success" | "error" | "info"; message: string; title?: string }
> = {
  login: { variant: "success", message: "Welcome back!", title: "Signed in" },
  register: { variant: "success", message: "Welcome to ZARIERA ✨", title: "Account created" },
  "admin-login": { variant: "success", message: "Signed in to the dashboard.", title: "Welcome" },
  "signed-out": { variant: "info", message: "You've been signed out." },
  "product-created": { variant: "success", message: "Product created.", title: "Saved" },
  "product-updated": { variant: "success", message: "Product updated.", title: "Saved" },
  "product-deleted": { variant: "success", message: "Product deleted." },
  "product-in-use": {
    variant: "error",
    message: "This product appears in past orders, so it can't be deleted. Untick \"Active\" to hide it instead.",
    title: "Not deleted",
  },
  "category-deleted": { variant: "success", message: "Category deleted." },
  "category-in-use": {
    variant: "error",
    message: "This category still has products. Move or delete them first.",
    title: "Not deleted",
  },
  "delete-failed": { variant: "error", message: "Could not delete — please try again.", title: "Not deleted" },
  "password-reset": { variant: "success", message: "Your password has been updated.", title: "All set" },
  "email-verified": { variant: "success", message: "Your email is verified.", title: "Thank you" },
  "verify-send-failed": {
    variant: "error",
    message: "We couldn't send the verification code right now. Please try again in a moment.",
    title: "Not sent",
  },
};

function FlashToastInner() {
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedFor = useRef("");

  useEffect(() => {
    const key = searchParams.get("flash");
    if (!key) return;

    // fire once per (path + key) so it doesn't repeat under dev StrictMode
    const sig = `${pathname}|${key}`;
    if (firedFor.current === sig) return;
    firedFor.current = sig;

    const entry = MESSAGES[key];
    if (entry) {
      const opts = entry.title ? { title: entry.title } : undefined;
      if (entry.variant === "success") toast.success(entry.message, opts);
      else if (entry.variant === "error") toast.error(entry.message, opts);
      else toast.info(entry.message, opts);
    }

    // Remove the flash param without a reload or extra history entry.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("flash");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, searchParams, toast, router]);

  return null;
}

export function FlashToast() {
  // useSearchParams must be inside a Suspense boundary.
  return (
    <Suspense fallback={null}>
      <FlashToastInner />
    </Suspense>
  );
}
