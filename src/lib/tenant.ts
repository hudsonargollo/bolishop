import { prisma } from "./prisma";

/** Slugs that belong to the platform, not to a tenant. */
export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "_next",
  "favicon.ico",
  "robots.txt",
  "sitemap.xml",
  "og",
  "uploads",
]);

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

/** Per-request tenant context keyed by tenantId. */
export function setTenantContext(tenantId: string) {
  (prisma as any).$use(async (params: any, next: any) => {
    const action = params.action;
    if (
      action === "findMany" ||
      action === "create" ||
      action === "update" ||
      action === "updateMany" ||
      action === "delete" ||
      action === "count" ||
      action === "groupBy" ||
      action === "aggregate"
    ) {
      params.args = params.args ?? {};
      params.args.where = { ...(params.args.where ?? {}), tenantId };
    }
    if (
      action === "findUnique" ||
      action === "findFirst" ||
      action === "upsert"
    ) {
      params.args = params.args ?? {};
      params.args.where = { ...(params.args.where ?? {}), tenantId };
    }
    return next(params);
  });
}

/** Convenience: resolve tenant and set Prisma query context for tenant scoping. */
export async function getTenantContext(slug: string): Promise<{ tenantId: string; currency: string } | null> {
  const t = await getTenant(slug);
  if (!t) return null;
  setTenantContext(t.id);
  return { tenantId: t.id, currency: t.currency };
}
