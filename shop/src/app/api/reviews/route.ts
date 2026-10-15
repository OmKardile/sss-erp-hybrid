import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body?.slug;
    const customerName = (body?.customerName || "").trim();
    const rating = Math.min(5, Math.max(1, Number(body?.rating || 5)));
    const comment = (body?.comment || "").trim() || null;

    if (!slug || !customerName) {
      return NextResponse.json(
        { error: "slug and customerName required" },
        { status: 400 },
      );
    }
    const product = await db.shopProduct.findUnique({ where: { slug } });
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const review = await db.review.create({
      data: { productId: product.id, customerName, rating, comment },
    });
    return NextResponse.json({ review }, { status: 201 });
  } catch (err: any) {
    console.error("[reviews POST]", err);
    return NextResponse.json(
      { error: "Failed to add review", detail: err?.message },
      { status: 500 },
    );
  }
}
