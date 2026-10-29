import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_TENANT_SLUG, RESERVED_SLUGS } from "@/lib/tenant-config";

/**
 * Stamps the tenant the request belongs to into `x-tenant-slug`, so server
 * components and server actions can scope their queries without every form
 * having to carry a hidden field.
 *
 * - "/acme/..."      → acme (unless acme is a platform path like /admin or /api)
 * - "/acme"          → acme
 * - anything else    → the deployment's default tenant (legacy /admin, /api, root)
 */
export function proxy(request: NextRequest) {
  const first = decodeURIComponent(request.nextUrl.pathname.split("/")[1] ?? "");
  const slug =
    first && !RESERVED_SLUGS.has(first) && !first.startsWith("favicon") ? first : DEFAULT_TENANT_SLUG;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-slug", slug);
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip static assets and the (disk-backed) upload files; everything else —
  // pages, RSC/flight requests, API routes and server actions — gets the stamp.
  matcher: "/((?!_next/static|_next/image|uploads/.+|favicon.ico).*)",
};
