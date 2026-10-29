import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
import { prisma } from "./prisma";
import { DEFAULT_TENANT_SLUG } from "./tenant-config";

export { RESERVED_SLUGS, DEFAULT_TENANT_SLUG } from "./tenant-config";

import { RESERVED_SLUGS } from "./tenant-config";

export type TenantView = {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  tagline: string | null;
  publicUrl: string | null;
  currency: string;
  logo: string | null;
  brandColor: string | null;
  active: boolean;
};

/** Server-only: resolve one tenant by slug, or null if not found/inactive. */
export async function getTenant(slug: string): Promise<TenantView | null> {
  if (RESERVED_SLUGS.has(slug)) return null;
  try {
    const t = await prisma.tenant.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        displayName: true,
        tagline: true,
        publicUrl: true,
        currency: true,
        logo: true,
        brandColor: true,
        active: true,
      },
    });
    return t && t.active ? t : null;
  } catch {
    return null;
  }
}

/** Server-only: find by publicUrl/custom domain, or null. */
export async function getTenantByDomain(host: string): Promise<TenantView | null> {
  try {
    const t = await prisma.tenant.findFirst({
      where: { publicUrl: { contains: host }, active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        displayName: true,
        tagline: true,
        publicUrl: true,
        currency: true,
        logo: true,
        brandColor: true,
        active: true,
      },
    });
    return t;
  } catch {
    return null;
  }
}

/**
 * Slug of the tenant used by the pre-multitenant routes that have no tenant
 * context: legacy /admin pages, legacy /api/* handlers and the seeding /
 * create-admin scripts. (The canonical constant lives in ./tenant-config,
 * which proxy.ts imports without pulling in the DB client; re-exported here
 * for app code.)
 */
const DEFAULT_SELECT = {
  id: true,
  slug: true,
  name: true,
  displayName: true,
  tagline: true,
  publicUrl: true,
  currency: true,
  logo: true,
  brandColor: true,
  active: true,
} as const;

// Cheap and shared across requests; the store mounts the same helper everywhere.
const loadDefaultTenant = unstable_cache(
  async (): Promise<TenantView | null> => {
    // Named tenant first; else the oldest active tenant (single-tenant installs).
    const bySlug = await prisma.tenant.findUnique({
      where: { slug: DEFAULT_TENANT_SLUG },
      select: DEFAULT_SELECT,
    });
    if (bySlug?.active) return bySlug;
    return await prisma.tenant.findFirst({
      where: { active: true },
      orderBy: { createdAt: "asc" },
      select: DEFAULT_SELECT,
    });
  },
  ["default-tenant-v1"],
  { revalidate: 300 }
);

/** Server-only: the tenant legacy (non-[tenant]) routes operate on, or null
 *  when the database is unreachable / has no tenants. */
export async function getDefaultTenant(): Promise<TenantView | null> {
  try {
    return await loadDefaultTenant();
  } catch {
    return null;
  }
}

export async function getDefaultTenantId(): Promise<string | null> {
  return (await getDefaultTenant())?.id ?? null;
}

/** Resolves the [tenant] route param; renders the 404 page for unknown /
 *  inactive slugs. Use in every server page / layout / action under /[tenant]. */
export async function requireTenant(slug: string): Promise<TenantView> {
  const t = await getTenant(slug);
  if (!t) notFound();
  return t;
}
