// In-memory pub/sub for new-order notifications.
//
// When a customer places an order, `emitNewOrder` fans the event out to every
// connected admin (each holds an SSE stream — see /api/admin/orders/stream).
// The subscriber set lives on `globalThis` so it is shared across the module
// graph and survives dev hot-reloads (a single Node process).
//
// NOTE: this is process-local. It works perfectly on a single Node/VPS host
// (the typical deployment). On multi-instance or serverless hosting each
// instance has its own set, so cross-instance delivery would need an external
// broker (e.g. Redis pub/sub) — not required for this store.

export type NewOrderEvent = {
  id: string;
  orderNumber: string;
  total: number;
  customerName: string;
  createdAt: string; // ISO
};

type Subscriber = (event: NewOrderEvent) => void;

const globalForEvents = globalThis as unknown as {
  __zarieraOrderSubscribers?: Set<Subscriber>;
};

const subscribers: Set<Subscriber> =
  globalForEvents.__zarieraOrderSubscribers ??
  (globalForEvents.__zarieraOrderSubscribers = new Set<Subscriber>());

/** Subscribe to new-order events. Returns an unsubscribe function. */
export function subscribeToOrders(cb: Subscriber): () => void {
  subscribers.add(cb);
  return () => {
    subscribers.delete(cb);
  };
}

/** Broadcast a new order to all connected admins. Never throws. */
export function emitNewOrder(event: NewOrderEvent): void {
  for (const cb of subscribers) {
    try {
      cb(event);
    } catch {
      /* a broken subscriber must not affect the others */
    }
  }
}
