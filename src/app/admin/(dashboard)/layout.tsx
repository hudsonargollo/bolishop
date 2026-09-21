import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { logoutAction } from "../login/actions";
import { Emblem } from "@/components/brand/emblem";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--line)] bg-maroon text-cream md:flex">
        <Link href="/admin" className="flex items-center gap-2 border-b border-[rgba(230,205,139,0.2)] px-5 py-5">
          <Emblem size={24} className="text-gold" />
          <span className="gold-text font-serif text-lg font-bold tracking-[0.2em]">ZARIERA</span>
        </Link>

        <AdminNav />

        <div className="mt-auto border-t border-[rgba(230,205,139,0.2)] p-4">
          <p className="px-2 text-xs text-cream/50">{session.email}</p>
          <form action={logoutAction} className="mt-2">
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-cream/80 transition hover:bg-maroon-2 hover:text-gold">
              Sign out
            </button>
          </form>
          <Link
            href="/"
            className="mt-1 block rounded-md px-3 py-2 text-sm text-cream/60 transition hover:text-gold"
          >
            ← View store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1">
        {/* Mobile top bar */}
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-maroon px-4 py-3 text-cream md:hidden">
          <Link href="/admin" className="gold-text font-serif text-lg font-bold tracking-[0.2em]">
            ZARIERA
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-cream/70 transition hover:text-gold">
              View store
            </Link>
            <form action={logoutAction}>
              <button className="text-cream/80 transition hover:text-gold">Sign out</button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-5 py-8">{children}</div>
      </div>
    </div>
  );
}
