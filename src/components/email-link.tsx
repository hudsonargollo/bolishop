"use client";

import type { ReactNode } from "react";
import { useToast } from "@/components/ui/toast";

// A plain `mailto:` link does nothing when the visitor has no default mail app
// (very common on Windows / web-Gmail users). This copies the address and shows
// a toast first, then still hands off to the mail app if one is installed.
export function EmailLink({
  email,
  className,
  ariaLabel,
  children,
}: {
  email: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const toast = useToast();

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(email);
      toast.success(`${email} — paste it in your email app or Gmail.`, { title: "Email copied" });
    } catch {
      // Clipboard blocked (e.g. non-secure context): still show the address.
      toast.info(email, { title: "Our email" });
    }
  }

  return (
    <a href={`mailto:${email}`} onClick={handleClick} aria-label={ariaLabel} className={className}>
      {children}
    </a>
  );
}
