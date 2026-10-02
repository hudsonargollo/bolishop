import { NextResponse } from "next/server";
import { createOrder, cancelOrderAndRestock } from "@/lib/orders";
import { initiatePayment, isOnlineConfigured, type PaymentMethod } from "@/lib/payments";
import { getCustomerSession, startCustomerSession } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, MIN_PASSWORD } from "@/lib/password";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";
import { siteUrl } from "@/lib/site";

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
  if (!email || password.length < MIN_PASSWORD) return false;

  try {
    // Unique index on email makes this race-safe: a duplicate throws P2002 and
    // the order simply stays a guest order.
    const created = await prisma.customer.create({
      data: { name: name || email, email, passwordHash: hashPassword(password) },
    });
    await prisma.order.update({
      where: { orderNumber },
      data: { customerId: created.id },
    });
    await startCustomerSession({ id: created.id, email: created.email, name: created.name });
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (!/P2002|Unique constraint/i.test(msg)) {
      console.error("[order] guest account creation failed (order still placed):", err);
    }
    return false;
  }
}

export async function POST(request: Request) {
  if (!rateLimit(`order:${await clientIp()}`, 10, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: TOO_MANY }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = body as any;
  const method: PaymentMethod = input?.paymentMethod;

  // Never take an "online" order we can't actually charge — it would look
  // confirmed to the shopper while no payment is ever collected.
  if ((method === "PAYFAST" || method === "SAFEPAY") && !isOnlineConfigured(method)) {
    return NextResponse.json(
      { ok: false, error: "Online payment isn't available yet. Please choose Cash on Delivery." },
      { status: 400 }
    );
  }

  // Link the order to the signed-in customer account, if any.
  const session = await getCustomerSession();
  const result = await createOrder(input, session?.id ?? null);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  // Guest first-order sign-up (only when not already signed in).
  const accountCreated = session ? false : await maybeCreateGuestAccount(input, result.orderNumber);

  if (method === "PAYFAST" || method === "SAFEPAY") {
    const order = encodeURIComponent(result.orderNumber);
    const payfastCallback = `${siteUrl}/api/payments/payfast/callback`;
    const payment = await initiatePayment(method, {
      orderNumber: result.orderNumber,
      amount: result.total,
      customer: {
        name: String(input.customerName ?? ""),
        email: String(input.email ?? ""),
        phone: String(input.phone ?? ""),
      },
      returnUrl:
        method === "PAYFAST" ? payfastCallback : `${siteUrl}/checkout/success?order=${order}`,
      cancelUrl:
        method === "PAYFAST" ? payfastCallback : `${siteUrl}/api/payments/cancel?order=${order}`,
      notifyUrl:
        method === "PAYFAST" ? payfastCallback : `${siteUrl}/api/payments/safepay/webhook`,
    });

    if (payment.configured && payment.ok) {
      if (payment.reference) {
        await prisma.order
          .update({ where: { orderNumber: result.orderNumber }, data: { paymentRef: payment.reference } })
          .catch((err) => console.error("[order] could not save payment reference:", err));
      }
      return NextResponse.json(
        { ...result, accountCreated, redirectUrl: payment.redirectUrl },
        { status: 201 }
      );
    }

    // Gateway unreachable/rejected: release the stock and tell the shopper.
    console.error("[order] payment initiation failed:", payment.configured ? payment.error : "not configured");
    const placed = await prisma.order.findUnique({
      where: { orderNumber: result.orderNumber },
      select: { id: true },
    });
    if (placed) {
      await prisma.order.update({ where: { id: placed.id }, data: { paymentStatus: "FAILED" } });
      await cancelOrderAndRestock(placed.id);
    }
    return NextResponse.json(
      {
        ok: false,
        error: "We couldn't connect to the payment provider. Please try again or choose Cash on Delivery.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ...result, accountCreated }, { status: 201 });
}
