import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Seed sample products so the storefront isn't empty on first run.
 * Idempotent: matches by erpProductId and skips existing.
 */
const SAMPLE_PRODUCTS = [
  {
    erpProductId: "seed_001",
    name: "Aashirvaad Atta — Whole Wheat",
    brand: "Aashirvaad",
    category: "Groceries",
    description:
      "Premium whole wheat atta, stone-ground for soft and fluffy rotis. 5 kg pack.",
    price: 245,
    compareAtPrice: 280,
    unitType: "5 kg",
    stock: 40,
    isFeatured: true,
    image: "/products/atta.jpg",
  },
  {
    erpProductId: "seed_002",
    name: "Amul Taaza Toned Milk",
    brand: "Amul",
    category: "Dairy",
    description: "Pasteurised & homogenised toned milk. 500 ml pouch.",
    price: 27,
    unitType: "500 ml",
    stock: 60,
    isFeatured: true,
    image: "/products/milk-taaza.jpg",
  },
  {
    erpProductId: "seed_003",
    name: "Britannia Marie Gold Biscuits",
    brand: "Britannia",
    category: "Snacks",
    description: "Light and crispy Marie biscuits — perfect with tea. 200 g.",
    price: 35,
    compareAtPrice: 40,
    unitType: "200 g",
    stock: 80,
    image: "/products/marie-gold.jpg",
  },
  {
    erpProductId: "seed_004",
    name: "Tata Salt — Iodised",
    brand: "Tata",
    category: "Groceries",
    description: "Vacuum evaporated iodised salt. 1 kg.",
    price: 28,
    unitType: "1 kg",
    stock: 100,
    image: "/products/tata-salt.jpg",
  },
  {
    erpProductId: "seed_005",
    name: "Surf Excel Easy Wash Detergent",
    brand: "Surf Excel",
    category: "Household",
    description:
      "Powerful stain removal with less water. Front & top load. 1 kg.",
    price: 115,
    compareAtPrice: 135,
    unitType: "1 kg",
    stock: 25,
    image: "/products/surf-excel.jpg",
  },
  {
    erpProductId: "seed_006",
    name: "Maggi 2-Minute Masala Noodles",
    brand: "Maggi",
    category: "Snacks",
    description: "Instant noodles with classic masala tastemaker. 70 g.",
    price: 14,
    unitType: "70 g",
    stock: 200,
    isFeatured: true,
    image: "/products/maggi.jpg",
  },
  {
    erpProductId: "seed_007",
    name: "Coca-Cola — PET Bottle",
    brand: "Coca-Cola",
    category: "Beverages",
    description: "Refreshing chilled Coca-Cola. 750 ml PET bottle.",
    price: 40,
    unitType: "750 ml",
    stock: 50,
    image: "/products/coca-cola.jpg",
  },
  {
    erpProductId: "seed_008",
    name: "Dabur Honey — 100% Pure",
    brand: "Dabur",
    category: "Groceries",
    description: "Raw, unprocessed natural honey. 250 g jar.",
    price: 95,
    compareAtPrice: 110,
    unitType: "250 g",
    stock: 30,
    image: "/products/honey.jpg",
  },
  {
    erpProductId: "seed_009",
    name: "Colgate Strong Teeth Toothpaste",
    brand: "Colgate",
    category: "Personal Care",
    description: "Anti-cavity toothpaste with calcium. 200 g.",
    price: 95,
    unitType: "200 g",
    stock: 45,
    image: "/products/colgate.jpg",
  },
  {
    erpProductId: "seed_010",
    name: "Modern Bread — Sandwich",
    brand: "Modern",
    category: "Bakery",
    description: "Soft, fluffy white sandwich bread. 400 g.",
    price: 40,
    unitType: "400 g",
    stock: 20,
    image: "/products/bread.jpg",
  },
  {
    erpProductId: "seed_011",
    name: "Banana — Robusta",
    brand: null,
    category: "Fruits & Vegetables",
    description: "Fresh ripe robusta bananas. 1 dozen.",
    price: 48,
    unitType: "1 dozen",
    stock: 35,
    isFeatured: true,
    image: "/products/banana.jpg",
  },
  {
    erpProductId: "seed_012",
    name: "Onion — Loose",
    brand: null,
    category: "Fruits & Vegetables",
    description: "Fresh loose onions. 1 kg.",
    price: 35,
    compareAtPrice: 45,
    unitType: "1 kg",
    stock: 60,
    image: "/products/onion.jpg",
  },
  {
    erpProductId: "seed_013",
    name: "Tomato — Hybrid",
    brand: null,
    category: "Fruits & Vegetables",
    description: "Fresh hybrid tomatoes. 1 kg.",
    price: 30,
    unitType: "1 kg",
    stock: 50,
    image: "/products/tomato.jpg",
  },
  {
    erpProductId: "seed_014",
    name: "Mother Dairy Curd",
    brand: "Mother Dairy",
    category: "Dairy",
    description: "Thick and creamy classic curd. 400 g cup.",
    price: 35,
    unitType: "400 g",
    stock: 40,
    image: "/products/curd.jpg",
  },
  {
    erpProductId: "seed_015",
    name: "Lays — India's Magic Masala",
    brand: "Lays",
    category: "Snacks",
    description: "Crunchy potato chips with magic masala flavour. 52 g.",
    price: 20,
    unitType: "52 g",
    stock: 90,
    image: "/products/lays.jpg",
  },
  {
    erpProductId: "seed_016",
    name: "Fortune Sunflower Refined Oil",
    brand: "Fortune",
    category: "Groceries",
    description: "Refined sunflower oil for everyday cooking. 1 L pouch.",
    price: 145,
    compareAtPrice: 165,
    unitType: "1 L",
    stock: 30,
    image: "/products/sunflower-oil.jpg",
  },
];

export async function POST(req: NextRequest) {
  try {
    let created = 0;
    let updated = 0;

    for (const p of SAMPLE_PRODUCTS) {
      const existing = await db.shopProduct.findUnique({
        where: { erpProductId: p.erpProductId },
      });
      const slug = generateSlug(p.name);
      if (existing) {
        await db.shopProduct.update({
          where: { id: existing.id },
          data: { ...p, slug: existing.slug },
        });
        updated++;
      } else {
        // ensure slug unique
        let finalSlug = slug;
        const exists = await db.shopProduct.findUnique({
          where: { slug: finalSlug },
        });
        if (exists) {
          finalSlug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
        }
        await db.shopProduct.create({ data: { ...p, slug: finalSlug } });
        created++;
      }
    }

    // add a few reviews on featured products
    const featured = await db.shopProduct.findMany({
      where: { isFeatured: true },
    });
    for (const fp of featured) {
      const have = await db.review.count({ where: { productId: fp.id } });
      if (have > 0) continue;
      const samples = [
        {
          customerName: "Aditya K.",
          rating: 5,
          comment: "Excellent quality and quick delivery. Will order again!",
        },
        {
          customerName: "Sneha P.",
          rating: 4,
          comment: "Good product, packaging could be better.",
        },
        {
          customerName: "Rohit M.",
          rating: 5,
          comment: "Fresh and exactly as described.",
        },
      ];
      await db.review.createMany({
        data: samples.map((s) => ({ ...s, productId: fp.id })),
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Sample data seeded",
      created,
      updated,
      total: await db.shopProduct.count(),
    });
  } catch (err: any) {
    console.error("[seed POST]", err);
    return NextResponse.json(
      { error: "Seed failed", detail: err?.message },
      { status: 500 },
    );
  }
}
