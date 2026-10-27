import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { averageRating } from "@/lib/utils";
import type { ProductDetail, ProductListItem } from "@/lib/types";

export const dynamic = "force-dynamic";

function mapDetail(p: any): ProductDetail {
  const ratings = (p.reviews ?? []).map((r: any) => r.rating);
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
    description: p.description ?? null,
    isActive: !!p.isActive,
    reviews: (p.reviews ?? []).map((r: any) => ({
      id: r.id,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment ?? null,
      createdAt: r.createdAt,
    })),
    avgRating: averageRating(ratings),
    reviewCount: ratings.length,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const product = await db.shopProduct.findUnique({
      where: { slug },
      include: {
        reviews: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ product: mapDetail(product) });
  } catch (err) {
    return dbErrorResponse("product GET", err);
  }
}
