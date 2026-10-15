import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface SyncProduct {
  erpProductId: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  description?: string | null;
  price: number;
  compareAtPrice?: number | null;
  unitType?: string;
  stock?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  image?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const syncToken = process.env.ERP_SYNC_TOKEN;
    const headerToken = req.headers.get("x-sync-token");

    if (!syncToken || !headerToken || headerToken !== syncToken) {
      return NextResponse.json(
        { error: "Unauthorized — invalid sync token" },
        { status: 401 },
      );
    }

    const body = await req.json();
    const products: SyncProduct[] = Array.isArray(body?.products)
      ? body.products
      : Array.isArray(body)
        ? body
        : [];

    if (products.length === 0) {
      return NextResponse.json(
        { error: "No products provided. Send { products: [...] }" },
        { status: 400 },
      );
    }

    let created = 0;
    let updated = 0;
    const errors: { erpProductId: string; error: string }[] = [];

    for (const p of products) {
      try {
        if (!p.erpProductId || !p.name || p.price == null) {
          errors.push({
            erpProductId: p.erpProductId || "?",
            error: "erpProductId, name and price are required",
          });
          continue;
        }

        const data = {
          erpProductId: p.erpProductId,
          name: p.name,
          brand: p.brand ?? null,
          category: p.category ?? null,
          description: p.description ?? null,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          unitType: p.unitType ?? "pcs",
          stock: Number(p.stock ?? 0),
          isFeatured: !!p.isFeatured,
          isActive: p.isActive ?? true,
          image: p.image ?? null,
        };

        const existing = await db.shopProduct.findUnique({
          where: { erpProductId: p.erpProductId },
        });

        if (existing) {
          // Keep slug stable to preserve URLs unless name changed
          await db.shopProduct.update({
            where: { id: existing.id },
            data: { ...data, slug: existing.slug },
          });
          updated++;
        } else {
          // Generate unique slug
          let slug = generateSlug(p.name);
          const existsSlug = await db.shopProduct.findUnique({
            where: { slug },
          });
          if (existsSlug) {
            slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
          }
          await db.shopProduct.create({ data: { ...data, slug } });
          created++;
        }
      } catch (e: any) {
        errors.push({
          erpProductId: p.erpProductId || "?",
          error: e?.message || "Unknown error",
        });
      }
    }

    return NextResponse.json({
      ok: true,
      received: products.length,
      created,
      updated,
      errors,
    });
  } catch (err: any) {
    console.error("[sync POST]", err);
    return NextResponse.json(
      { error: "Sync failed", detail: err?.message },
      { status: 500 },
    );
  }
}

/** Optional: GET returns sync status / counts. */
export async function GET() {
  try {
    const total = await db.shopProduct.count();
    const active = await db.shopProduct.count({ where: { isActive: true } });
    const featured = await db.shopProduct.count({
      where: { isFeatured: true, isActive: true },
    });
    return NextResponse.json({ total, active, featured });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to read sync status", detail: err?.message },
      { status: 500 },
    );
  }
}
