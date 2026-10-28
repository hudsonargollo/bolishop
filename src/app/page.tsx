import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BOLISTORE — Multi-tenant store platform",
    template: "%s · BOLISTORE",
  },
  description:
    "BOLISTORE: launch your own branded store in minutes. One platform, infinite niches. Powered by ClubeMKT.",
  openGraph: {
    title: "BOLISTORE — Your store, your brand",
    description: "Launch your own branded store in minutes. Multi-tenant, customizable, ready to sell.",
    type: "website",
    url: siteUrl,
    siteName: "BOLISTORE",
  },
  twitter: {
    card: "summary_large_image",
    title: "BOLISTORE — Your store, your brand",
    description: "Launch your own branded store in minutes.",
  },
};

const FEATURES = [
  {
    title: "Your brand, your store",
    body: "Custom name, logo, colors, currency and contact. The default premium jewelry look is just the starting point.",
    icon: "◆",
  },
  {
    title: "Catalog & orders built in",
    body: "Products, categories, stock, checkout, order tracking and customer accounts — everything a store needs.",
    icon: "◇",
  },
  {
    title: "Multi-tenant by design",
    body: "One platform, isolated data per store. Add as many tenants as you need without code changes.",
    icon: "○",
  },
  {
    title: "Admin dashboard",
    body: "Manage products, categories, orders, customers and settings per store. No spreadsheets required.",
    icon: "□",
  },
  {
    title: "Payments & shipping",
    body: "Cash on Delivery, PayFast and Safepay ready. Flat-rate or free-threshold shipping configurable per store.",
    icon: "△",
  },
  {
    title: "Fast, reliable hosting",
    body: "Next.js on Cloudflare Pages with edge caching, static export and instant deploys.",
    icon: "⬡",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-[0.2em] text-[#E6FF57]">BOLISTORE</span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/zariera"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-[#E6FF57]/60 hover:text-[#E6FF57]"
            >
              View demo
            </Link>
            <Link
              href="/admin/login"
              className="rounded-full bg-[#E6FF57] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-[#cbf77a]"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2"
            style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(230,255,87,0.12), transparent 70%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center sm:py-32">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E6FF57]">
            Multi-tenant store platform
          </span>
          <h1 className="mt-8 font-serif text-5xl font-bold tracking-tight sm:text-6xl">
            Your store, <span className="text-[#E6FF57]">your brand</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            Launch a fully functional storefront in minutes. Customize the look, add your catalog,
            and start selling — all isolated under your own tenant.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/login"
              className="rounded-full bg-[#E6FF57] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#cbf77a]"
            >
              Create your store
            </Link>
            <Link
              href="/zariera"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-[#E6FF57]/60 hover:text-[#E6FF57]"
            >
              See the demo →
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Default demo: ZARIERA — premium stainless-steel jewelry.
          </p>
        </div>
      </section>

      {/* Bento features */}
      <section className="border-y border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-[#E6FF57]/40"
              >
                <div className="text-2xl text-[#E6FF57]">{f.icon}</div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-slate-50">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(50% 50% at 50% 100%, rgba(230,255,87,0.08), transparent 70%)" }}
        />
        <div className="relative mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 className="font-serif text-4xl font-bold sm:text-5xl">
            Ready to open your store?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Start with the default premium look. Customize later — name, catalog, colors, currency and policies.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin/login"
              className="rounded-full bg-[#E6FF57] px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-[#cbf77a]"
            >
              Get started
            </Link>
            <Link
              href="/zariera"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-[#E6FF57]/60 hover:text-[#E6FF57]"
            >
              Browse demo store
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-6xl px-5 py-10 text-center text-xs text-slate-500">
          <span className="font-semibold text-[#E6FF57]">BOLISTORE</span> · powered by{" "}
          <span className="text-slate-300">ClubeMKT</span> · {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
