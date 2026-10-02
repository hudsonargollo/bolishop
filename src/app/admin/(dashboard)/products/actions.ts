"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export type ProductFormState = { error?: string };

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().nonnegative("Price must be 0 or more"),
  compareAtPrice: z.coerce.number().nonnegative().optional(),
  sku: z.string().optional(),
  stock: z.coerce.number().int().min(0),
  material: z.string().optional(),
  specs: z.string().optional(),
  categoryId: z.string().min(1, "Choose a category"),
  images: z.string().optional(),
  featured: z.boolean(),
  active: z.boolean(),
});

function parse(formData: FormData) {
  return schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice") || undefined,
    sku: formData.get("sku"),
    stock: formData.get("stock"),
    material: formData.get("material"),
    specs: formData.get("specs"),
    categoryId: formData.get("categoryId"),
    images: formData.get("images"),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
  });
}

function toData(d: z.infer<typeof schema>) {
  return {
    name: d.name,
    slug: d.slug ? slugify(d.slug) : slugify(d.name),
    description: d.description || null,
    price: d.price,
    compareAtPrice: d.compareAtPrice ?? null,
    sku: d.sku || null,
    stock: d.stock,
    material: d.material || null,
    specs: d.specs?.trim() || null,
    categoryId: d.categoryId,
    images: (d.images ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean),
    featured: d.featured,
    active: d.active,
  };
}

export async function createProduct(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await prisma.product.create({ data: toData(parsed.data) });
  } catch (err) {
    return { error: dbError(err) };
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout"); // storefront (home is cached 5 min) sees the change now
  redirect("/admin/products?flash=product-created");
}

export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await prisma.product.update({ where: { id }, data: toData(parsed.data) });
  } catch (err) {
    return { error: dbError(err) };
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout"); // storefront (home is cached 5 min) sees the change now
  redirect("/admin/products?flash=product-updated");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  let flash = "product-deleted";
  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    // P2003 = foreign key: the product appears in past orders (kept for history).
    flash = /P2003|Foreign key/i.test(msg) ? "product-in-use" : "delete-failed";
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout"); // storefront (home is cached 5 min) sees the change now
  redirect(`/admin/products?flash=${flash}`);
}

function dbError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "";
  if (/connect|ECONNREFUSED|P1001|P1000/i.test(msg)) {
    return "Database not connected. Connect DATABASE_URL to save products.";
  }
  if (/Unique constraint|P2002/i.test(msg)) {
    return "A product with that slug or SKU already exists.";
  }
  return "Could not save the product. Please try again.";
}
