import { z } from "zod";
import { prisma } from "./prisma";
import { shippingFor } from "./shipping";
import { sendOrderEmails } from "./email";

export { shippingFor, FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING } from "./shipping";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(7, "Enter a valid phone number"),
  address: z.string().min(5, "Enter your delivery address"),
  city: z.string().min(2, "Enter your city"),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(["COD", "PAYFAST", "SAFEPAY"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CreateOrderResult =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: string };

// User-facing validation problems (bad cart) vs unexpected server errors.
class OrderValidationError extends Error {}

function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `ZR-${stamp}-${rand}`;
}

export async function createOrder(
  input: CheckoutInput,
  customerId?: string | null
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid order" };
  }
  const data = parsed.data;

  try {
    // Re-price against the database to prevent client-side tampering,
    // validate stock, then create the order and decrement stock atomically.
    const ids = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: ids }, active: true },
      select: { id: true, name: true, price: true, stock: true },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    const lineItems = data.items.map((i) => {
      const p = byId.get(i.productId);
      if (!p)
        throw new OrderValidationError(
          `"${i.name}" is no longer available. Please remove it from your cart and try again.`
        );
      if (p.stock < i.quantity)
        throw new OrderValidationError(
          `Only ${p.stock} left of "${p.name}". Please lower the quantity.`
        );
      return { productId: p.id, name: p.name, price: Number(p.price), quantity: i.quantity };
    });

    const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping = shippingFor(subtotal);
    const total = subtotal + shipping;
    const orderNumber = generateOrderNumber();

    // Only attach a customerId that actually exists — a stale session cookie
    // pointing at a deleted account would otherwise cause a foreign-key error.
    let safeCustomerId: string | null = null;
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });
      safeCustomerId = customer?.id ?? null;
    }

    await prisma.$transaction([
      prisma.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode || null,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod,
          customerId: safeCustomerId,
          subtotal,
          shipping,
          total,
          items: { create: lineItems },
        },
      }),
      ...lineItems.map((i) =>
        prisma.product.update({
          where: { id: i.productId },
          data: { stock: { decrement: i.quantity } },
        })
      ),
    ]);

    // Order is safely saved. Email is best-effort — never fail a saved order
    // just because SMTP is unavailable.
    try {
      await sendOrderEmails({
        orderNumber,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        paymentMethod: data.paymentMethod,
        items: lineItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
        subtotal,
        shipping,
        total,
      });
    } catch (emailErr) {
      console.error("[order] email send failed (order still saved):", emailErr);
    }

    return { ok: true, orderNumber, total };
  } catch (err) {
    // Cart/stock problems are safe to show to the customer verbatim.
    if (err instanceof OrderValidationError) {
      return { ok: false, error: err.message };
    }
    // Anything else is an unexpected server/database error. Log the real
    // cause for us, show the customer a clear (non-fake) failure — never a
    // fake success that silently loses the order.
    console.error("[order] failed to create order:", err);
    return {
      ok: false,
      error: "Sorry, we couldn't place your order right now. Please try again in a moment.",
    };
  }
}
