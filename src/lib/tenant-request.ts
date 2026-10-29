import { headers } from "next/headers";
import { DEFAULT_TENANT_SLUG } from "./tenant-config";
import { getTenant, type TenantView } from "./tenant";

/**
 * The tenant this request belongs to, as stamped by src/proxy.ts
 * (`x-tenant-slug`). Usable from server components, server actions and route
 * handlers. Falls back to the deployment's default tenant when the proxy
 * didn't run (e.g. some API routes registered before the stamp existed).
 */
export async function currentTenantSlug(): Promise<string> {
  const h = await headers();
  return h.get("x-tenant-slug") ?? DEFAULT_TENANT_SLUG;
}

/** Resolves `currentTenantSlug()` to a tenant; null when unknown/inactive. */
export async function currentTenant(): Promise<TenantView | null> {
  return await getTenant(await currentTenantSlug());
}
