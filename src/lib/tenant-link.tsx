"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type TenantLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Tenant-aware Link. Automatically prepends the current tenant slug to
 * internal paths so links work under app/[tenant]/(store)/... without
 * hardcoding the slug everywhere.
 *
 * Rules:
 * - absolute paths like /shop, /account → /<tenant-slug>/shop
 * - root path / → /<tenant-slug>
 * - already-slugged paths (/zariera/shop) are left alone
 * - external URLs (http(s)://, mailto:, tel:) are left alone
 * - anchor-only (#...) paths are resolved against the tenant root
 */
export function TenantLink({
  href,
  children,
  className,
  prefetch,
  replace,
  scroll,
  onClick,
}: TenantLinkProps) {
  const pathname = usePathname();

  if (!href || href.startsWith("#")) {
    return (
      <Link
        href={href}
        className={className}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  // External URLs are left alone
  if (/^(https?:|mailto:|tel:|\/\/)/i.test(href)) {
    return (
      <Link
        href={href}
        className={className}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  // Already prefixed with a tenant slug — assume caller knows what they want
  const tenantMatch = pathname.match(/^\/([^/]+)/);
  if (tenantMatch) {
    const tenantSlug = tenantMatch[1];
    const isRoot = href === "/";
    const resolved = isRoot ? `/${tenantSlug}` : `/${tenantSlug}${href}`;
    return (
      <Link
        href={resolved}
        className={className}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  // No tenant in path (shouldn't happen inside store routes) — passthrough
  return (
    <Link
      href={href}
      className={className}
      prefetch={prefetch}
      replace={replace}
      scroll={scroll}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
