import type { Metadata } from "next";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm, type CheckoutDefaults } from "@/components/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Prefill the form for a signed-in customer.
  let defaults: CheckoutDefaults | undefined;
  const session = await getCustomerSession();
  if (session) {
    defaults = { name: session.name, email: session.email };
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: session.id },
        select: { phone: true },
      });
      if (customer?.phone) defaults.phone = customer.phone;
    } catch {
      /* phone is optional — ignore lookup failures */
    }
  }

  return <CheckoutForm defaults={defaults} />;
}
