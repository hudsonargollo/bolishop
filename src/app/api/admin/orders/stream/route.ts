import { getVerifiedAdmin } from "@/lib/admin";
import { subscribeToOrders, type NewOrderEvent } from "@/lib/order-events";
import { prisma } from "@/lib/prisma";

// Server-Sent Events stream of new orders for the admin bell.
//  - Instant path: the in-memory event bus (same Node process, e.g. a VPS).
//  - Reliable path: polls the DB every few seconds for orders newer than the
//    client's `since` cursor. This is what makes alerts work on serverless
//    hosts (Netlify), where the order may be created in another instance and
//    the stream itself is cut after a few seconds (the client reconnects with
//    an updated `since`). Events are de-duplicated by order id.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const POLL_MS = 5000;

export async function GET(request: Request): Promise<Response> {
  const session = await getVerifiedAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const sinceParam = new URL(request.url).searchParams.get("since");
  const parsed = sinceParam ? new Date(sinceParam) : new Date();
  // Never replay more than 10 minutes of history.
  let cursor = new Date(Math.max(isNaN(parsed.getTime()) ? Date.now() : parsed.getTime(), Date.now() - 10 * 60_000));

  const encoder = new TextEncoder();
  const sent = new Set<string>();
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let poller: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* stream already closed */
        }
      };
      const sendOrder = (order: NewOrderEvent) => {
        if (sent.has(order.id)) return;
        sent.add(order.id);
        write(`event: order\ndata: ${JSON.stringify(order)}\n\n`);
      };

      write(`event: ready\ndata: ${JSON.stringify({ ok: true, at: Date.now() })}\n\n`);

      unsubscribe = subscribeToOrders(sendOrder);

      const poll = async () => {
        try {
          const rows = await prisma.order.findMany({
            where: { createdAt: { gt: cursor } },
            orderBy: { createdAt: "asc" },
            take: 20,
            select: { id: true, orderNumber: true, total: true, customerName: true, createdAt: true },
          });
          for (const o of rows) {
            if (o.createdAt > cursor) cursor = o.createdAt;
            sendOrder({
              id: o.id,
              orderNumber: o.orderNumber,
              total: Number(o.total),
              customerName: o.customerName,
              createdAt: o.createdAt.toISOString(),
            });
          }
        } catch (err) {
          console.error("[orders/stream] poll failed:", err);
        }
      };
      void poll(); // catch up immediately after a reconnect
      poller = setInterval(poll, POLL_MS);

      // Comment heartbeat keeps proxies from closing an idle connection.
      heartbeat = setInterval(() => write(`: ping\n\n`), 25000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
      if (poller) clearInterval(poller);
      unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Disable proxy buffering (nginx) so events flush immediately.
      "X-Accel-Buffering": "no",
    },
  });
}
