// Platform-only slugs — the first path segment of these URLs is never a tenant.
// Imported by proxy.ts, so it must stay free of DB / react imports.
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

/**
 * Slug of the tenant used by the pre-multitenant routes that have no tenant
 * context: legacy /admin pages, legacy /api/* handlers and the seeding /
 * create-admin scripts. Configurable so each deployment names its own default.
 */
export const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "zariera";
