import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSlug } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapProduct(p: any): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    brand: p.brand ?? null,
    category: p.category ?? null,
    unitType: p.unitType ?? "pcs",
    stock: p.stock ?? 0,
    image: p.image ?? null,
    isFeatured: !!p.isFeatured,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q")?.trim();
    const featured = searchParams.get("featured") === "true";

    const where: any = { isActive: true };
    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }
    if (featured) {
      where.isFeatured = true;
    }

    const products = await db.shopProduct.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 200,
    });

    const data = products.map(mapProduct);

    return NextResponse.json({
      items: data,
      count: data.length,
      categories: Array.from(
        new Set(products.map((p) => p.category).filter(Boolean) as string[]),
      ),
    });
  } catch (err: any) {
    console.error("[products GET]", err);
    return NextResponse.json(
      { error: "Failed to load products", detail: err?.message },
      { status: 500 },
    );
  }
}

/** Optional convenience endpoint: create a single product (admin use). */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || body?.price == null) {
      return NextResponse.json(
        { error: "name and price are required" },
        { status: 400 },
      );
    }
    const slug = body.slug || generateSlug(body.name);
    const product = await db.shopProduct.create({
      data: {
        erpProductId: body.erpProductId || `local_${Date.now()}`,
        name: body.name,
        brand: body.brand ?? null,
        category: body.category ?? null,
        slug,
        description: body.description ?? null,
        price: Number(body.price),
        compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
        unitType: body.unitType ?? "pcs",
        stock: body.stock ?? 0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? false,
        image: body.image ?? null,
      },
    });
    return NextResponse.json({ product: mapProduct(product) }, { status: 201 });
  } catch (err: any) {
    console.error("[products POST]", err);
    return NextResponse.json(
      { error: "Failed to create product", detail: err?.message },
      { status: 500 },
    );
  }
}
