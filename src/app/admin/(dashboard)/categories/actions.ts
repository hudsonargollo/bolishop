"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

export type CategoryState = { error?: string; ok?: boolean };

const schema = z.object({
  name: z.string().min(2, "Enter a category name"),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export async function createCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  await requireAdmin();
  const parsed = schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, slug, description } = parsed.data;
  try {
    await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug ? slugify(slug) : slugify(name),
        description: description?.trim() || null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (/Unique constraint|P2002/i.test(msg))
      return { error: "A category with that name or slug already exists." };
    if (/connect|ECONNREFUSED|P1001|P1000/i.test(msg))
      return { error: "Database unavailable. Please try again." };
    return { error: "Could not create the category." };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  let flash = "category-deleted";
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/shop");
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    flash = /P2003|Foreign key/i.test(msg) ? "category-in-use" : "delete-failed";
  }
  revalidatePath("/admin/categories");
  redirect(`/admin/categories?flash=${flash}`);
}
