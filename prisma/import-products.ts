import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type P = {
  name: string;
  slug: string;
  category: "rings" | "bracelets" | "necklaces" | "earrings";
  price: number;
  compareAtPrice?: number;
  material: string;
  stock: number;
  featured: boolean;
  image: string;
  description: string;
};

const CARE =
  " Crafted in premium stainless steel — rust-free, hypoallergenic and made to keep its shine. Keep away from perfumes and water; wipe with a soft dry cloth.";

const PRODUCTS: P[] = [
  {
    name: "Aria Woven Chain Bracelet",
    slug: "aria-woven-chain-bracelet",
    category: "bracelets",
    price: 2850,
    compareAtPrice: 3400,
    material: "Gold-Plated Stainless Steel",
    stock: 25,
    featured: true,
    image: "/images/products/aria-woven-chain-bracelet.jpg",
    description:
      "A supple multi-strand woven chain that drapes beautifully on the wrist, finished with a secure lobster clasp and adjustable extender for the perfect fit." +
      CARE,
  },
  {
    name: "Elysia Solitaire Ring",
    slug: "elysia-solitaire-ring",
    category: "rings",
    price: 2200,
    compareAtPrice: 2600,
    material: "Gold-Plated Stainless Steel",
    stock: 30,
    featured: true,
    image: "/images/products/elysia-solitaire-ring.jpg",
    description:
      "A timeless four-prong solitaire set with a brilliant round cubic zirconia on a slim polished band — understated sparkle for everyday elegance or stacking." +
      CARE,
  },
  {
    name: "Nora Bow Snake-Chain Bracelet",
    slug: "nora-bow-bracelet",
    category: "bracelets",
    price: 2600,
    material: "Gold-Plated Stainless Steel",
    stock: 22,
    featured: false,
    image: "/images/products/nora-bow-bracelet.jpg",
    description:
      "A sleek snake chain tied with a delicate center bow — a soft, romantic touch that sits flat and elegant on the wrist. Adjustable length with a lobster clasp." +
      CARE,
  },
  {
    name: "Reine Beaded Medallion Bangle",
    slug: "reine-medallion-bangle",
    category: "bracelets",
    price: 3500,
    compareAtPrice: 4200,
    material: "Gold-Plated Stainless Steel",
    stock: 15,
    featured: true,
    image: "/images/products/reine-medallion-bangle.jpg",
    description:
      "A double beaded bangle centerd with a pavé cubic-zirconia medallion — a statement of quiet luxury with a secure hinged closure for easy wear." +
      CARE,
  },
  {
    name: "Mira Lattice Cuff Bangle",
    slug: "mira-lattice-cuff",
    category: "bracelets",
    price: 3200,
    material: "Gold-Plated Stainless Steel",
    stock: 18,
    featured: false,
    image: "/images/products/mira-lattice-cuff.jpg",
    description:
      "A bold open cuff with an intricate diamond-lattice cut-out — architectural, modern and effortlessly eye-catching. Hinged for a comfortable, secure fit." +
      CARE,
  },
  {
    name: "Ivy Petal-Link Bracelet",
    slug: "ivy-petal-bracelet",
    category: "bracelets",
    price: 2400,
    material: "Gold-Plated Stainless Steel",
    stock: 26,
    featured: false,
    image: "/images/products/ivy-petal-bracelet.jpg",
    description:
      "Overlapping petal links form a smooth, fluid band that catches the light with every movement — a graceful everyday piece with an adjustable clasp." +
      CARE,
  },
  {
    name: "Verona Enamel-Stripe Ring",
    slug: "verona-stripe-ring",
    category: "rings",
    price: 1900,
    material: "Gold-Plated Stainless Steel",
    stock: 35,
    featured: false,
    image: "/images/products/verona-stripe-ring.jpg",
    description:
      "A clean flat band accented with a signature red-and-green enamel stripe and a subtle dotted motif — a sporty-luxe unisex ring that pairs with everything." +
      CARE,
  },
  {
    name: "Catena Pavé Link Bangle",
    slug: "catena-pave-bangle",
    category: "bracelets",
    price: 3800,
    compareAtPrice: 4500,
    material: "Gold-Plated Stainless Steel",
    stock: 14,
    featured: true,
    image: "/images/products/catena-pave-bangle.jpg",
    description:
      "A striking bangle with a raised chain-link center lit up in sparkling pavé cubic zirconia — high-shine glamour with a secure hinged clasp." +
      CARE,
  },
  {
    name: "Regalia Crown Ring",
    slug: "regalia-crown-ring",
    category: "rings",
    price: 2100,
    material: "Gold-Plated Stainless Steel",
    stock: 28,
    featured: false,
    image: "/images/products/regalia-crown-ring.jpg",
    description:
      "A layered band topped with a polished crown motif and a delicate row of cubic zirconia — a playful, regal statement for the everyday queen." +
      CARE,
  },
  {
    name: "Noir Clover Ring",
    slug: "noir-clover-ring",
    category: "rings",
    price: 2300,
    compareAtPrice: 2700,
    material: "Gold-Plated Stainless Steel",
    stock: 24,
    featured: false,
    image: "/images/products/noir-clover-ring.jpg",
    description:
      "A lucky four-leaf clover set with deep black onyx and framed by a fine beaded edge, flanked by gold beads on a slim band — chic, minimal and timeless." +
      CARE,
  },
  {
    name: "Amara Engraved 'LOVE' Heart Band Ring",
    slug: "amara-love-heart-ring",
    category: "rings",
    price: 2500,
    compareAtPrice: 3000,
    material: "Gold-Plated Stainless Steel",
    stock: 20,
    featured: true,
    image: "/images/products/amara-love-heart-ring.jpg",
    description:
      "Express romance with a contemporary edge. This faceted octagonal band displays engraved L-O-V-E lettering with a delicate heart inset holding a sparkling crystal — a modern, high-fashion statement for daily wear or stacking." +
      CARE,
  },
  {
    name: "Trèfle Pearl Clover Ring",
    slug: "pearl-clover-ring",
    category: "rings",
    price: 2300,
    material: "Gold-Plated Stainless Steel",
    stock: 24,
    featured: false,
    image: "/images/products/pearl-clover-ring.jpg",
    description:
      "A luminous mother-of-pearl four-leaf clover framed in a fine beaded edge, accented with gold beads — soft, feminine and endlessly wearable." +
      CARE,
  },
  {
    name: "Astra Scattered Pavé Bangle",
    slug: "astra-pave-bangle",
    category: "bracelets",
    price: 3600,
    material: "Gold-Plated Stainless Steel",
    stock: 16,
    featured: false,
    image: "/images/products/astra-pave-bangle.jpg",
    description:
      "A slim, refined bangle scattered with cubic-zirconia dots and lines like a trail of stars — subtle sparkle that layers perfectly. Hinged secure closure." +
      CARE,
  },
  {
    name: "Papillon Butterfly Bangle",
    slug: "papillon-butterfly-bangle",
    category: "bracelets",
    price: 3900,
    compareAtPrice: 4600,
    material: "Gold-Plated Stainless Steel",
    stock: 12,
    featured: true,
    image: "/images/products/papillon-butterfly-bangle.jpg",
    description:
      "An open bangle crowned with a pavé cubic-zirconia butterfly — a graceful symbol of transformation and one of our most-loved statement pieces." +
      CARE,
  },
  {
    name: "Regent Two-Tone Crown Ring",
    slug: "regent-crown-ring",
    category: "rings",
    price: 2400,
    material: "Two-Tone Stainless Steel",
    stock: 20,
    featured: false,
    image: "/images/products/regent-crown-ring.jpg",
    description:
      "A bold watch-link inspired band in two-tone silver and gold, finished with a crown emblem — a confident, unisex everyday statement that never tarnishes." +
      CARE,
  },
];

const CATEGORIES = [
  { name: "Necklaces", slug: "necklaces", description: "Chains, pendants and statement necklaces." },
  { name: "Rings", slug: "rings", description: "Bands, solitaires and statement rings." },
  { name: "Earrings", slug: "earrings", description: "Studs, hoops and drops." },
  { name: "Bracelets", slug: "bracelets", description: "Bangles, cuffs and chain bracelets." },
];

async function main() {
  console.log("Importing ZARIERA products…");

  // ⚠️ DESTRUCTIVE: wipes ALL orders and products. Pre-launch only — refuses to
  // run unless explicitly confirmed, and never against a production env.
  if (process.env.NODE_ENV === "production" || process.env.CONFIRM_WIPE !== "yes") {
    console.error(
      "Refusing to run: this deletes ALL orders and products.\n" +
        "Re-run with CONFIRM_WIPE=yes (and never on the live database)."
    );
    process.exit(1);
  }

  // Clean slate (pre-launch sample data)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  console.log("  cleared old products & test orders");

  // Categories
  const idBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    idBySlug.set(c.slug, cat.id);
  }

  // Products
  for (const p of PRODUCTS) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        material: p.material,
        stock: p.stock,
        featured: p.featured,
        active: true,
        images: [p.image],
        categoryId: idBySlug.get(p.category)!,
      },
    });
  }

  console.log(`  ✔ created ${PRODUCTS.length} products`);
  console.log("✅ Import complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
