/**
 * Bundled demo catalog — the same 16 seed products the web storefront's
 * /api/seed route plants. Lets the app run fully offline / before the
 * store owner wires the live API base URL (Settings → Live store API).
 */

import type { ProductDetail, ProductListItem } from "./types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Bundled photo per seed slug (require() so Metro bundles them into the APK). */
const PHOTOS: Record<string, number> = {
  "aashirvaad-atta-whole-wheat": require("../../assets/products/atta.jpg"),
  "amul-taaza-toned-milk": require("../../assets/products/milk-taaza.jpg"),
  "britannia-marie-gold-biscuits": require("../../assets/products/marie-gold.jpg"),
  "tata-salt-iodised": require("../../assets/products/tata-salt.jpg"),
  "surf-excel-easy-wash-detergent": require("../../assets/products/surf-excel.jpg"),
  "maggi-2-minute-masala-noodles": require("../../assets/products/maggi.jpg"),
  "coca-cola-pet-bottle": require("../../assets/products/coca-cola.jpg"),
  "dabur-honey-100-pure": require("../../assets/products/honey.jpg"),
  "colgate-strong-teeth-toothpaste": require("../../assets/products/colgate.jpg"),
  "modern-bread-sandwich": require("../../assets/products/bread.jpg"),
  "banana-robusta": require("../../assets/products/banana.jpg"),
  "onion-loose": require("../../assets/products/onion.jpg"),
  "tomato-hybrid": require("../../assets/products/tomato.jpg"),
  "mother-dairy-curd": require("../../assets/products/curd.jpg"),
  "lays-indias-magic-masala": require("../../assets/products/lays.jpg"),
  "fortune-sunflower-refined-oil": require("../../assets/products/sunflower-oil.jpg"),
};

interface SeedProduct {
  id: string;
  name: string;
  brand: string | null;
  category: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  unitType: string;
  stock: number;
  isFeatured?: boolean;
}

const SEEDS: SeedProduct[] = [
  { id: "seed_001", name: "Aashirvaad Atta — Whole Wheat", brand: "Aashirvaad", category: "Groceries", description: "Premium whole wheat atta, stone-ground for soft and fluffy rotis. 5 kg pack.", price: 245, compareAtPrice: 280, unitType: "5 kg", stock: 40, isFeatured: true },
  { id: "seed_002", name: "Amul Taaza Toned Milk", brand: "Amul", category: "Dairy", description: "Pasteurised & homogenised toned milk. 500 ml pouch.", price: 27, unitType: "500 ml", stock: 60, isFeatured: true },
  { id: "seed_003", name: "Britannia Marie Gold Biscuits", brand: "Britannia", category: "Snacks", description: "Light and crispy Marie biscuits — perfect with tea. 200 g.", price: 35, compareAtPrice: 40, unitType: "200 g", stock: 80 },
  { id: "seed_004", name: "Tata Salt — Iodised", brand: "Tata", category: "Groceries", description: "Vacuum evaporated iodised salt. 1 kg.", price: 28, unitType: "1 kg", stock: 100 },
  { id: "seed_005", name: "Surf Excel Easy Wash Detergent", brand: "Surf Excel", category: "Household", description: "Powerful stain removal with less water. Front & top load. 1 kg.", price: 115, compareAtPrice: 135, unitType: "1 kg", stock: 25 },
  { id: "seed_006", name: "Maggi 2-Minute Masala Noodles", brand: "Maggi", category: "Snacks", description: "Instant noodles with classic masala tastemaker. 70 g.", price: 14, unitType: "70 g", stock: 200, isFeatured: true },
  { id: "seed_007", name: "Coca-Cola — PET Bottle", brand: "Coca-Cola", category: "Beverages", description: "Refreshing chilled Coca-Cola. 750 ml PET bottle.", price: 40, unitType: "750 ml", stock: 50 },
  { id: "seed_008", name: "Dabur Honey — 100% Pure", brand: "Dabur", category: "Groceries", description: "Raw, unprocessed natural honey. 250 g jar.", price: 95, compareAtPrice: 110, unitType: "250 g", stock: 30 },
  { id: "seed_009", name: "Colgate Strong Teeth Toothpaste", brand: "Colgate", category: "Personal Care", description: "Anti-cavity toothpaste with calcium. 200 g.", price: 95, unitType: "200 g", stock: 45 },
  { id: "seed_010", name: "Modern Bread — Sandwich", brand: "Modern", category: "Bakery", description: "Soft, fluffy white sandwich bread. 400 g.", price: 40, unitType: "400 g", stock: 20 },
  { id: "seed_011", name: "Banana — Robusta", brand: null, category: "Fruits & Vegetables", description: "Fresh ripe robusta bananas. 1 dozen.", price: 48, unitType: "1 dozen", stock: 35, isFeatured: true },
  { id: "seed_012", name: "Onion — Loose", brand: null, category: "Fruits & Vegetables", description: "Fresh loose onions. 1 kg.", price: 35, compareAtPrice: 45, unitType: "1 kg", stock: 60 },
  { id: "seed_013", name: "Tomato — Hybrid", brand: null, category: "Fruits & Vegetables", description: "Fresh hybrid tomatoes. 1 kg.", price: 30, unitType: "1 kg", stock: 50 },
  { id: "seed_014", name: "Mother Dairy Curd", brand: "Mother Dairy", category: "Dairy", description: "Thick and creamy classic curd. 400 g cup.", price: 35, unitType: "400 g", stock: 40 },
  { id: "seed_015", name: "Lays — India's Magic Masala", brand: "Lays", category: "Snacks", description: "Crunchy potato chips with magic masala flavour. 52 g.", price: 20, unitType: "52 g", stock: 90 },
  { id: "seed_016", name: "Fortune Sunflower Refined Oil", brand: "Fortune", category: "Groceries", description: "Refined sunflower oil for everyday cooking. 1 L pouch.", price: 145, compareAtPrice: 165, unitType: "1 L", stock: 30 },
];

const DEMO_REVIEWS = [
  { customerName: "Aditya K.", rating: 5, comment: "Excellent quality and quick delivery. Will order again!" },
  { customerName: "Sneha P.", rating: 4, comment: "Good product, packaging could be better." },
  { customerName: "Rohit M.", rating: 5, comment: "Fresh and exactly as described." },
];

export const DEMO_PRODUCTS: ProductListItem[] = SEEDS.map((s) => ({
  id: s.id,
  name: s.name,
  slug: slugify(s.name),
  price: s.price,
  compareAtPrice: s.compareAtPrice ?? null,
  brand: s.brand,
  category: s.category,
  unitType: s.unitType,
  stock: s.stock,
  image: `demo://${slugify(s.name)}`,
  isFeatured: !!s.isFeatured,
}));

export function demoImageFor(slug: string): number | null {
  return PHOTOS[slug] ?? null;
}

export function demoDetailFor(slug: string): ProductDetail | null {
  const item = DEMO_PRODUCTS.find((p) => p.slug === slug);
  if (!item) return null;
  const seed = SEEDS.find((s) => s.id === item.id)!;
  const reviews = DEMO_REVIEWS.map((r, i) => ({
    id: `${item.id}-rev-${i}`,
    customerName: r.customerName,
    rating: r.rating,
    comment: r.comment,
    createdAt: new Date(Date.now() - (i + 1) * 86400000 * 3).toISOString(),
  }));
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return {
    ...item,
    description: seed.description,
    isActive: true,
    reviews,
    avgRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  };
}

export const DEMO_CATEGORIES = Array.from(
  new Set(DEMO_PRODUCTS.map((p) => p.category).filter(Boolean) as string[]),
);
