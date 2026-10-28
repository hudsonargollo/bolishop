import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { DbBanner } from "@/components/admin/db-banner";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "./actions";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Products" };

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin(); // layouts don't re-run on client navigation
  const { dbConnected, products } = await getAdminProducts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-semibold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-maroon px-5 py-2.5 text-sm font-medium text-light transition hover:bg-maroon-2"
        >
          + Add product
        </Link>
      </div>

      <div className="mt-6">
        {!dbConnected && <DbBanner />}

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-cream-soft py-16 text-center">
            <p className="font-serif text-xl text-ink">No products yet</p>
            <p className="mt-1 text-sm text-muted">
              {dbConnected ? "Add your first product to get started." : "Connect the database to manage products."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-cream-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{p.name}</span>
                      {p.featured && (
                        <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[0.65rem] text-gold-deep">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3 text-ink">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-ink">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {p.active ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/products/${p.id}`} className="text-sm text-gold-deep hover:underline">
                          Edit
                        </Link>
                        <DeleteButton
                          action={deleteProduct.bind(null, p.id)}
                          confirmText={`Delete "${p.name}"?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
