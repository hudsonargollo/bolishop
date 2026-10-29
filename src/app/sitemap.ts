import type { MetadataRoute } from "next";
import { getProducts, getCategories } from "@/lib/catalog";

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

// One sitemap per deployment: every active tenant's store pages plus its
// products/categories, all under the tenant's slug (/{tenant}/shop/...).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let tenants: { id: string; slug: string }[] = [];
  try {
    tenants = await prisma.tenant.findMany({
      where: { active: true },
      select: { id: true, slug: true },
      orderBy: { createdAt: "asc" },
    });
  } catch {
    return [{ url: `${siteUrl}/`, changeFrequency: "weekly", priority: 1 }];
  }

  const entries: MetadataRoute.Sitemap = [];

  for (const tenant of tenants) {
    const [products, categories] = await Promise.all([
      getProducts(tenant.id),
      getCategories(tenant.id),
    ]);

    // Static pages
    for (const path of [
      `/${tenant.slug}`,
      `/${tenant.slug}/shop`,
      `/${tenant.slug}/about`,
      `/${tenant.slug}/custom`,
      `/${tenant.slug}/contact`,
      `/${tenant.slug}/shipping`,
      `/${tenant.slug}/care`,
      `/${tenant.slug}/faq`,
    ]) {
      entries.push({
        url: `${siteUrl}${path}`,
        changeFrequency: "weekly",
        priority: path === `/${tenant.slug}` ? 1 : 0.7,
      });
    }

    for (const c of categories) {
      entries.push({
        url: `${siteUrl}/${tenant.slug}/shop/${c.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const p of products) {
      entries.push({
        url: `${siteUrl}/${tenant.slug}/product/${p.slug}`,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
