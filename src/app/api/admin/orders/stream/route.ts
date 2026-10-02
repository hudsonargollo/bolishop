import { getVerifiedAdmin } from "@/lib/admin";
import { subscribeToOrders } from "@/lib/order-events";

// Long-lived Server-Sent Events stream. Must run on the Node runtime (shares
// the in-memory event bus with the order-creation code) and never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await getVerifiedAdmin();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const encoder = new TextEncoder();
  let unsubscribe: () => void = () => {};
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          /* stream already closed */
        }
      };
      const send = (event: string, data: unknown) =>
        write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

      // Tell the client we're connected.
      send("ready", { ok: true, at: Date.now() });

      // Forward every new order.
      unsubscribe = subscribeToOrders((order) => send("order", order));

      // Comment heartbeat keeps proxies from closing an idle connection.
      heartbeat = setInterval(() => write(`: ping\n\n`), 25000);
    },
    cancel() {
      if (heartbeat) clearInterval(heartbeat);
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
