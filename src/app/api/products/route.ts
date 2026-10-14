import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await db.product.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await db.product.create({
      data: {
        name: String(body.name ?? "").trim(),
        brand: body.brand ? String(body.brand).trim() : null,
        category: body.category ? String(body.category).trim() : null,
        sku: body.sku ? String(body.sku).trim() : null,
        purchasePrice: Number(body.purchasePrice) || 0,
        sellingPrice: Number(body.sellingPrice) || 0,
        quantity: Number(body.quantity) || 0,
        unitType: String(body.unitType ?? "pcs"),
        minStockAlert: Number(body.minStockAlert) || 0,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create product" },
      { status: 400 }
    );
  }
}
