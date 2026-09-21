import Link from "next/link";
import { Emblem } from "./brand/emblem";

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Collection", href: "/shop" },
  { label: "Custom", href: "/custom" },
  { label: "Contact", href: "/contact" },
];

const HELP = [
  { label: "Order Status", href: "/account/orders" },
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "Care Guide", href: "/care" },
  { label: "FAQ", href: "/faq" },
];

const TRUST = [
  "Cash on Delivery",
  "Secure Checkout",
  "Nationwide Shipping",
  "Rust-free & Hypoallergenic",
];

export function SiteFooter() {
  return (
    <footer
      className="relative mt-24 overflow-hidden text-cream/80"
      style={{ background: "linear-gradient(180deg, #3d1019 0%, #2a0b12 100%)" }}
    >
      {/* gold top accent + soft glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[rgba(214,178,104,0.6)] to-transparent" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        style={{ background: "radial-gradient(50% 100% at 50% 0%, rgba(214,178,104,0.10), transparent 70%)" }}
      />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-12 md:gap-10">
        {/* Brand + socials */}
        <div className="flex flex-col items-center text-center md:col-span-4 md:items-start md:text-left">
          <div className="flex items-center gap-2.5">
            <Emblem size={34} className="text-gold" />
            <span className="gold-text font-serif text-2xl font-bold tracking-[0.24em]">ZARIERA</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/60">
            Premium stainless steel &amp; artificial jewelry — gold-plated, rust-free and made to
            last. Every jewel tells a story.
          </p>
          <div className="mt-6 flex gap-3">
            <Social href="https://instagram.com" label="Instagram">
              <InstagramIcon />
            </Social>
            <Social href="https://facebook.com" label="Facebook">
              <FacebookIcon />
            </Social>
            <Social href="https://wa.me/923000000000" label="WhatsApp">
              <WhatsAppIcon />
            </Social>
            <Social href="mailto:hello@zariera.com" label="Email">
              <MailIcon />
            </Social>
          </div>
        </div>

        {/* Explore */}
        <FooterCol title="Explore" links={NAV} className="md:col-span-2" />

        {/* Help */}
        <FooterCol title="Help" links={HELP} className="md:col-span-3" />

        {/* Contact */}
        <div className="flex flex-col items-center text-center md:col-span-3 md:items-start md:text-left">
          <h3 className="eyebrow mb-4 text-gold">Get in touch</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li className="flex items-center justify-center gap-2.5 md:justify-start">
              <PinIcon /> Lahore, Pakistan
            </li>
            <li>
              <a href="mailto:hello@zariera.com" className="flex items-center justify-center gap-2.5 transition-colors hover:text-gold md:justify-start">
                <MailIcon /> hello@zariera.com
              </a>
            </li>
            <li>
              <a href="tel:+923000000000" className="flex items-center justify-center gap-2.5 transition-colors hover:text-gold md:justify-start">
                <PhoneIcon /> +92 300 0000000
              </a>
            </li>
            <li className="flex items-center justify-center gap-2.5 md:justify-start">
              <ClockIcon /> Mon–Sat, 11am – 8pm
            </li>
          </ul>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative border-t border-[rgba(230,205,139,0.15)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-cream/55">
          {TRUST.map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2.4">
                <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-[rgba(230,205,139,0.15)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-center text-xs text-cream/45 sm:flex-row sm:text-left">
          <span>© {new Date().getFullYear()} ZARIERA. All rights reserved.</span>
          <span>Crafted with care · Premium Stainless Steel Jewelry</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  className = "",
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <nav className={`flex flex-col items-center gap-3 text-center md:items-start md:text-left ${className}`}>
      <h3 className="eyebrow mb-1 text-gold">{title}</h3>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="group inline-flex items-center gap-2 text-sm text-cream/70 transition-colors hover:text-gold"
        >
          <span className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-4" />
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(230,205,139,0.35)] text-cream/80 transition hover:border-gold hover:bg-gold hover:text-maroon"
    >
      {children}
    </a>
  );
}

/* ---- icons ---- */
function InstagramIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="3" width="18" height="18" rx="5.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 8.5V7c0-.8.2-1.2 1.4-1.2H17V3h-2.6C11.7 3 11 4.4 11 6.4v2.1H9V11h2v9h3v-9h2.2l.3-2.5H14z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 0 1 6.7 12.4l-.3.4.7 2.5-2.6-.7-.4.2A8 8 0 1 1 12 4zm-2.9 3.9c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.6-.3c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.7c-.2-.5-.4-.4-.5-.4h-.4z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l1 5v3H4z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
