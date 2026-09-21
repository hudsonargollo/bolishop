import { prisma } from "./prisma";

export type AdminStats = {
  dbConnected: boolean;
  products: number;
  orders: number;
  pendingOrders: number;
  revenue: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [products, orders, pendingOrders, revenueAgg] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
    ]);
    return {
      dbConnected: true,
      products,
      orders,
      pendingOrders,
      revenue: Number(revenueAgg._sum.total ?? 0),
    };
  } catch {
    return { dbConnected: false, products: 0, orders: 0, pendingOrders: 0, revenue: 0 };
  }
}

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  featured: boolean;
  active: boolean;
  category: string;
};

export async function getAdminProducts(): Promise<{
  dbConnected: boolean;
  products: AdminProduct[];
}> {
  try {
    const rows = await prisma.product.findMany({
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return {
      dbConnected: true,
      products: rows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        stock: p.stock,
        featured: p.featured,
        active: p.active,
        category: p.category.name,
      })),
    };
  } catch {
    return { dbConnected: false, products: [] };
  }
}

export type AdminProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  material: string | null;
  images: string[];
  featured: boolean;
  active: boolean;
  categoryId: string;
};

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  try {
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
      sku: p.sku,
      stock: p.stock,
      material: p.material,
      images: p.images,
      featured: p.featured,
      active: p.active,
      categoryId: p.categoryId,
    };
  } catch {
    return null;
  }
}

export async function getCategoriesForSelect(): Promise<{ id: string; name: string }[]> {
  try {
    return await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export type AdminOrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  itemCount: number;
};

export async function getAdminOrders(): Promise<{
  dbConnected: boolean;
  orders: AdminOrderRow[];
}> {
  try {
    const rows = await prisma.order.findMany({
      include: { items: { select: { quantity: true } } },
      orderBy: { createdAt: "desc" },
    });
    return {
      dbConnected: true,
      orders: rows.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        total: Number(o.total),
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
        itemCount: o.items.reduce((n, i) => n + i.quantity, 0),
      })),
    };
  } catch {
    return { dbConnected: false, orders: [] };
  }
}

export async function getAdminOrder(id: string) {
  try {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!o) return null;
    return {
      ...o,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({ ...i, price: Number(i.price) })),
    };
  } catch {
    return null;
  }
}
