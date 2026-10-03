import type { Metadata } from "next";
import { getCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { CheckoutForm, type CheckoutDefaults } from "@/components/checkout-form";
import { payfastConfigured, safepayConfigured } from "@/lib/payments";
import { getProductBySlug } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/settings";
import type { CartItem } from "@/components/cart/cart-provider";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const sp = await searchParams;
  const p = Array.isArray(sp.payment) ? sp.payment[0] : sp.payment;
  const paymentNotice = p === "cancelled" || p === "failed" ? p : null;

  // "Buy it now": check out a single product instead of the whole cart.
  let buyNow: CartItem | null = null;
  const buySlug = Array.isArray(sp.buy) ? sp.buy[0] : sp.buy;
  if (buySlug) {
    const product = await getProductBySlug(buySlug);
    const qtyRaw = Number(Array.isArray(sp.qty) ? sp.qty[0] : sp.qty);
    if (product && product.stock > 0) {
      buyNow = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0],
        material: product.material,
        stock: product.stock,
        quantity: Math.min(product.stock, Math.max(1, Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 1)),
      };
    }
  }

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

  return (
    <CheckoutForm
      defaults={defaults}
      paymentNotice={paymentNotice}
      buyNow={buyNow}
      shippingRules={(await getStoreSettings()).shipping}
      gateways={{ PAYFAST: payfastConfigured(), SAFEPAY: safepayConfigured() }}
    />
  );
}
