import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminProduct, getCategoriesForSelect } from "@/lib/admin-data";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../actions";
import { requireTenantAdmin } from "@/lib/admin";

export const metadata = { title: "Edit product" };

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: PageProps<"/[tenant]/admin/products/[id]">) {
  const { tenant: tenantSlug } = await params;
  const { tenantId } = await requireTenantAdmin(tenantSlug); // layouts don't re-run on client navigation
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProduct(tenantId, id),
    getCategoriesForSelect(tenantId),
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-muted hover:text-ink">
        ← Back to products
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink">Edit Product</h1>

      <div className="mt-6">
        <ProductForm
          action={action}
          categories={categories}
          product={product}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}
