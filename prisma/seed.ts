import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

const categories: { name: string; slug: string; description: string }[] = [
  { name: "Necklaces", slug: "necklaces", description: "Statement and everyday necklaces." },
  { name: "Rings", slug: "rings", description: "Solitaires, bands and cocktail rings." },
  { name: "Earrings", slug: "earrings", description: "Studs, hoops and drops." },
  { name: "Bracelets", slug: "bracelets", description: "Bangles, tennis and charm bracelets." },
];

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  material: string;
  stock: number;
  featured: boolean;
  categorySlug: string;
};

const products: SeedProduct[] = [
  {
    name: "Aurelia Pendant Necklace",
    slug: "aurelia-pendant-necklace",
    description: "A delicate gold-plated stainless steel pendant with a sparkling cubic zirconia.",
    price: 48000,
    compareAtPrice: 56000,
    material: "Gold-Plated Steel",
    stock: 12,
    featured: true,
    categorySlug: "necklaces",
  },
  {
    name: "Seraphine Solitaire Ring",
    slug: "seraphine-solitaire-ring",
    description: "Timeless solitaire ring in polished silver-tone stainless steel with a brilliant cubic zirconia.",
    price: 62000,
    material: "Silver-Tone Steel",
    stock: 8,
    featured: true,
    categorySlug: "rings",
  },
  {
    name: "Lumière Drop Earrings",
    slug: "lumiere-drop-earrings",
    description: "Elegant drop earrings that catch the light with every move.",
    price: 35000,
    compareAtPrice: 41000,
    material: "Stainless Steel",
    stock: 20,
    featured: true,
    categorySlug: "earrings",
  },
  {
    name: "Élise Tennis Bracelet",
    slug: "elise-tennis-bracelet",
    description: "A classic tennis bracelet lined with brilliant cubic zirconia on gold-plated steel.",
    price: 74000,
    material: "Gold-Plated Steel",
    stock: 6,
    featured: true,
    categorySlug: "bracelets",
  },
  {
    name: "Noor Chain Necklace",
    slug: "noor-chain-necklace",
    description: "A refined everyday chain with a soft satin finish, gold-plated over steel.",
    price: 28000,
    material: "Gold-Plated Steel",
    stock: 25,
    featured: false,
    categorySlug: "necklaces",
  },
  {
    name: "Amara Stud Earrings",
    slug: "amara-stud-earrings",
    description: "Minimalist studs for effortless everyday elegance in hypoallergenic stainless steel.",
    price: 18000,
    material: "Stainless Steel",
    stock: 40,
    featured: false,
    categorySlug: "earrings",
  },
];

async function main() {
  console.log("🌱 Seeding ZARIERA database...");

  // Categories
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryIdBySlug.set(c.slug, cat.id);
  }
  console.log(`  ✔ ${categories.length} categories`);

  // Products
  for (const p of products) {
    const categoryId = categoryIdBySlug.get(p.categorySlug);
    if (!categoryId) continue;
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        material: p.material,
        stock: p.stock,
        featured: p.featured,
        categoryId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: new Prisma.Decimal(p.price),
        compareAtPrice: p.compareAtPrice ? new Prisma.Decimal(p.compareAtPrice) : null,
        material: p.material,
        stock: p.stock,
        featured: p.featured,
        categoryId,
      },
    });
  }
  console.log(`  ✔ ${products.length} products`);

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
