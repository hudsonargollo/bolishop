import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";
import { ContactForm } from "@/components/contact-form";
import { CONTACT } from "@/lib/contact";
import { EmailLink } from "@/components/email-link";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about an order, a custom piece, or anything else? Get in touch with ZARIERA.",
  alternates: { canonical: "/contact" },
};

const TOPICS: Record<string, string> = {
  custom: "Custom design request",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const sp = await searchParams;
  const raw = (Array.isArray(sp.topic) ? sp.topic[0] : sp.topic) ?? "";
  const topic = raw in TOPICS ? raw : undefined;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={44} className="mx-auto text-gold-deep" />
        <span className="eyebrow mt-3 block">Get in touch</span>
        <h1 className="mt-2 font-serif text-4xl font-semibold text-ink sm:text-5xl">Contact</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          {topic === "custom"
            ? "Tell us about the piece you have in mind — names, sizes, finish, occasion and budget — and we'll get back to you with ideas."
            : "Questions about an order, a custom piece, or anything else? We'd love to hear from you."}
        </p>
      </div>

      <div className="mt-12 grid gap-10 md:grid-cols-[1fr_260px]">
        <ContactForm topic={topic} defaultSubject={topic ? TOPICS[topic] : undefined} />

        <aside className="space-y-6 text-sm">
          {CONTACT.email && (
            <div>
              <h3 className="eyebrow mb-2">Email</h3>
              <EmailLink email={CONTACT.email} className="text-ink hover:text-gold-deep">
                {CONTACT.email}
              </EmailLink>
            </div>
          )}
          {CONTACT.phone && (
            <div>
              <h3 className="eyebrow mb-2">Phone</h3>
              <a href={CONTACT.phoneHref} className="text-ink hover:text-gold-deep">
                {CONTACT.phone}
              </a>
            </div>
          )}
          {CONTACT.whatsappUrl && (
            <div>
              <h3 className="eyebrow mb-2">WhatsApp</h3>
              <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-ink hover:text-gold-deep">
                Chat with us →
              </a>
            </div>
          )}
          <div>
            <h3 className="eyebrow mb-2">Hours</h3>
            <p className="text-ink">{CONTACT.hours}</p>
          </div>
          <div>
            <h3 className="eyebrow mb-2">Based in</h3>
            <p className="text-ink">{CONTACT.city}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
