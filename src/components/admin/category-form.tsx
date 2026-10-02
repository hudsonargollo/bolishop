"use client";

import { useActionState, useEffect, useRef } from "react";
import { createCategory } from "@/app/admin/(dashboard)/categories/actions";
import { useToast } from "@/components/ui/toast";

const input =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-gold focus:ring-2 focus:ring-[rgba(195,154,78,0.2)]";

export function AddCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, {});
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      toast.success("Category added", { title: "Saved" });
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-muted">Name</label>
          <input name="name" required placeholder="e.g. Earrings" className={input} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-muted">Slug (optional)</label>
          <input name="slug" placeholder="auto" className={input} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-muted">Description (optional)</label>
        <input name="description" placeholder="Short description" className={input} />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.ok && <p className="text-xs text-green-700">Category added ✓</p>}
      <button
        disabled={pending}
        className="rounded-full bg-maroon px-6 py-2.5 text-sm font-medium text-light transition hover:bg-maroon-2 disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add category"}
      </button>
    </form>
  );
}
