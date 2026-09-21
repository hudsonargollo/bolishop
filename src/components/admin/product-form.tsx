"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";
import type { AdminProductDetail } from "@/lib/admin-data";

type Action = (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: {
  action: Action;
  categories: { id: string; name: string }[];
  product?: AdminProductDetail;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <Row label="Name" required>
        <input name="name" required defaultValue={product?.name} className={input} />
      </Row>
      <Row label="Slug" hint="Leave blank to auto-generate from the name">
        <input name="slug" defaultValue={product?.slug} className={input} placeholder="auto" />
      </Row>
      <Row label="Description">
        <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className={input} />
      </Row>

      <div className="grid gap-5 sm:grid-cols-2">
        <Row label="Price (Rs)" required>
          <input name="price" type="number" min="0" step="1" required defaultValue={product?.price} className={input} />
        </Row>
        <Row label="Compare-at price (Rs)" hint="Optional — shows a strikethrough">
          <input name="compareAtPrice" type="number" min="0" step="1" defaultValue={product?.compareAtPrice ?? ""} className={input} />
        </Row>
        <Row label="Stock" required>
          <input name="stock" type="number" min="0" step="1" required defaultValue={product?.stock ?? 0} className={input} />
        </Row>
        <Row label="SKU">
          <input name="sku" defaultValue={product?.sku ?? ""} className={input} />
        </Row>
        <Row label="Material">
          <input name="material" defaultValue={product?.material ?? ""} className={input} placeholder="e.g. Gold-Plated Steel" />
        </Row>
        <Row label="Category" required>
          <select name="categoryId" required defaultValue={product?.categoryId ?? ""} className={input}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Row>
      </div>

      <Row label="Image URLs" hint="One per line or comma-separated (optional)">
        <textarea name="images" rows={2} defaultValue={product?.images.join("\n") ?? ""} className={input} />
      </Row>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="featured" defaultChecked={product?.featured} className="accent-[var(--color-gold-deep)]" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="accent-[var(--color-gold-deep)]" />
          Active (visible in store)
        </label>
      </div>

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2 disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link href="/admin/products" className="text-sm text-muted hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-md border border-[var(--line-strong)] bg-cream-soft px-3.5 py-2.5 text-sm outline-none focus:border-gold";

function Row({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm text-muted">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
