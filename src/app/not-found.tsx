import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
      <Emblem size={52} className="text-gold-deep" />
      <p className="mt-6 font-serif text-6xl font-bold text-gold-deep sm:text-7xl">404</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
        This page couldn&apos;t be found
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        The page you&apos;re looking for may have moved or no longer exists. Let&apos;s get you
        back to something beautiful.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-maroon px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-cream transition hover:bg-maroon-2"
        >
          Back to home
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-ink transition hover:border-gold hover:text-gold-deep"
        >
          Shop the collection
        </Link>
      </div>
    </main>
  );
}
