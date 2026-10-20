import type { CategoryView, ProductView } from "./types";

// Fallback catalog used until a real PostgreSQL database is connected.
// Mirrors prisma/seed.ts so the UI looks identical before and after DB hookup.

export const sampleCategories: CategoryView[] = [
  { id: "c-necklaces", name: "Necklaces", slug: "necklaces", description: "Statement and everyday necklaces." },
  { id: "c-rings", name: "Rings", slug: "rings", description: "Solitaires, bands and cocktail rings." },
  { id: "c-earrings", name: "Earrings", slug: "earrings", description: "Studs, hoops and drops." },
  { id: "c-bracelets", name: "Bracelets", slug: "bracelets", description: "Bangles, tennis and charm bracelets." },
];

export const sampleProducts: ProductView[] = [
  {
    id: "p1",
    name: "Aurelia Pendant Necklace",
    slug: "aurelia-pendant-necklace",
    description:
      "A delicate gold-plated stainless steel pendant with a sparkling cubic zirconia that catches the light beautifully. Rust-free and suspended on an adjustable chain.",
    price: 48000,
    compareAtPrice: 56000,
    material: "Gold-Plated Steel",
    stock: 12,
    images: [],
    featured: true,
    category: { name: "Necklaces", slug: "necklaces" },
  },
  {
    id: "p2",
    name: "Seraphine Solitaire Ring",
    slug: "seraphine-solitaire-ring",
    description:
      "Timeless solitaire ring in polished silver-tone stainless steel with a brilliant cubic zirconia — an everyday favorite that never tarnishes.",
    price: 62000,
    compareAtPrice: null,
    material: "Silver-Tone Steel",
    stock: 8,
    images: [],
    featured: true,
    category: { name: "Rings", slug: "rings" },
  },
  {
    id: "p3",
    name: "Lumière Drop Earrings",
    slug: "lumiere-drop-earrings",
    description:
      "Elegant drop earrings that catch the light with every move. Lightweight, hypoallergenic and comfortable for all-day wear.",
    price: 35000,
    compareAtPrice: 41000,
    material: "Stainless Steel",
    stock: 20,
    images: [],
    featured: true,
    category: { name: "Earrings", slug: "earrings" },
  },
  {
    id: "p4",
    name: "Élise Tennis Bracelet",
    slug: "elise-tennis-bracelet",
    description:
      "A classic tennis bracelet lined with brilliant cubic zirconia on gold-plated steel. Secure clasp and a fluid, comfortable fit.",
    price: 74000,
    compareAtPrice: null,
    material: "Gold-Plated Steel",
    stock: 6,
    images: [],
    featured: true,
    category: { name: "Bracelets", slug: "bracelets" },
  },
  {
    id: "p5",
    name: "Noor Chain Necklace",
    slug: "noor-chain-necklace",
    description:
      "A refined everyday chain with a soft satin finish. Understated, gold-plated and pairs with everything.",
    price: 28000,
    compareAtPrice: null,
    material: "Gold-Plated Steel",
    stock: 25,
    images: [],
    featured: false,
    category: { name: "Necklaces", slug: "necklaces" },
  },
  {
    id: "p6",
    name: "Amara Stud Earrings",
    slug: "amara-stud-earrings",
    description:
      "Minimalist studs for effortless everyday elegance. A wardrobe essential in hypoallergenic stainless steel.",
    price: 18000,
    compareAtPrice: null,
    material: "Stainless Steel",
    stock: 40,
    images: [],
    featured: false,
    category: { name: "Earrings", slug: "earrings" },
  },
  {
    id: "p7",
    name: "Celeste Halo Ring",
    slug: "celeste-halo-ring",
    description:
      "A halo of shimmering cubic zirconia surrounds a central stone for maximum sparkle. Set in gold-plated steel.",
    price: 58000,
    compareAtPrice: 65000,
    material: "Gold-Plated Steel",
    stock: 10,
    images: [],
    featured: false,
    category: { name: "Rings", slug: "rings" },
  },
  {
    id: "p8",
    name: "Ivy Bangle",
    slug: "ivy-bangle",
    description:
      "A sculptural open bangle with a smooth, modern silhouette in gold-plated steel. Effortless on its own or stacked.",
    price: 32000,
    compareAtPrice: null,
    material: "Gold-Plated Steel",
    stock: 18,
    images: [],
    featured: false,
    category: { name: "Bracelets", slug: "bracelets" },
  },
];
