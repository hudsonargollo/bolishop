import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { initiatePayment, type PaymentMethod } from "@/lib/payments";
import { getCustomerSession, startCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

// If a guest opted to create an account during checkout, register them,
// link this order to the new account and sign them in. Best-effort — a
// failure here (e.g. email already taken) must never fail the placed order.
async function maybeCreateGuestAccount(
  input: { email?: unknown; customerName?: unknown; createAccount?: unknown; password?: unknown },
  orderNumber: string
): Promise<boolean> {
  if (input.createAccount !== true) return false;
  const email = String(input.email ?? "").trim().toLowerCase();
  const name = String(input.customerName ?? "").trim();
  const password = String(input.password ?? "");
  if (!email || password.length < 6) return false;

  try {
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return false; // Email already registered — leave the order as a guest order.

    const created = await prisma.customer.create({
      data: { name: name || email, email, passwordHash: hashPassword(password) },
    });
    // Link the just-placed order to the new account.
    await prisma.order.update({
      where: { orderNumber },
      data: { customerId: created.id },
    });
    await startCustomerSession({ id: created.id, email: created.email, name: created.name });
    return true;
  } catch (err) {
    console.error("[order] guest account creation failed (order still placed):", err);
    return false;
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = body as any;
  // Link the order to the signed-in customer account, if any.
  const session = await getCustomerSession();
  const result = await createOrder(input, session?.id ?? null);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  // Guest first-order sign-up (only when not already signed in).
  const accountCreated = session ? false : await maybeCreateGuestAccount(input, result.orderNumber);

  // For online payment methods, try to initiate a gateway redirect.
  const method: PaymentMethod = input.paymentMethod;
  if (method === "PAYFAST" || method === "SAFEPAY") {
    const origin = new URL(request.url).origin;
    const payment = await initiatePayment(method, {
      orderNumber: result.orderNumber,
      amount: result.total,
      customer: {
        name: String(input.customerName ?? ""),
        email: String(input.email ?? ""),
        phone: String(input.phone ?? ""),
      },
      returnUrl: `${origin}/checkout/success?order=${encodeURIComponent(result.orderNumber)}&total=${result.total}`,
      cancelUrl: `${origin}/checkout?payment=cancelled`,
    });

    if (payment.configured && payment.ok) {
      return NextResponse.json(
        { ...result, accountCreated, redirectUrl: payment.redirectUrl },
        { status: 201 }
      );
    }
    // Not configured (or gateway error) → fall through to the pending-order
    // confirmation so the flow still completes. (Preview mode.)
  }

  return NextResponse.json({ ...result, accountCreated }, { status: 201 });
}
