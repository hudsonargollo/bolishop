"use server";

import { lookupOrder, type OrderLookupResult } from "@/lib/order-lookup";
import { courierLabel, trackingUrl } from "@/lib/couriers";
import { clientIp, rateLimit, TOO_MANY } from "@/lib/rate-limit";

export type LookupState = (
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "found";
      order: Extract<OrderLookupResult, { ok: true }>["order"] & {
        courierName: string | null;
        trackUrl: string | null;
      };
    }
) & { values?: { order: string; email: string } };

// Order tracking runs as a POST server action so the shopper's email never
// ends up in the URL / browser history / server logs.
export async function lookupOrderAction(prev: LookupState, formData: FormData): Promise<LookupState> {
  // Keep the typed order number + email visible after submit (React 19 resets the form).
  const values = { order: String(formData.get("order") ?? ""), email: String(formData.get("email") ?? "") };
  return { ...(await lookup(prev, formData)), values };
}

async function lookup(_prev: LookupState, formData: FormData): Promise<LookupState> {
  const orderNumber = String(formData.get("order") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim();
  if (!orderNumber || !email) {
    return { status: "error", message: "Enter your order number and email." };
  }
  if (!rateLimit(`track:${await clientIp()}`, 20, 10 * 60_000)) {
    return { status: "error", message: TOO_MANY };
  }

  const result = await lookupOrder(orderNumber, email);
  if (!result.ok) {
    return {
      status: "error",
      message:
        result.reason === "db-down"
          ? "Order tracking is not available right now. Please try again later or contact us."
          : "No order found with that number and email. Please check and try again.",
    };
  }
  const { courier, trackingNumber } = result.order;
  return {
    status: "found",
    order: {
      ...result.order,
      courierName: courier ? courierLabel(courier) : null,
      trackUrl: courier && trackingNumber ? trackingUrl(courier, trackingNumber) : null,
    },
  };
}
