import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const product = await db.product.update({
      where: { id },
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
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 400 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete product" },
      { status: 400 }
    );
  }
}
