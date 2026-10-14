import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const supplier = searchParams.get("supplier");
  const where = supplier ? { supplierName: { contains: supplier } } : {};
  const purchases = await db.purchase.findMany({
    where,
    orderBy: { purchaseDate: "desc" },
  });
  return NextResponse.json(purchases);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const quantity = Number(body.quantity) || 0;
    const unitPrice = Number(body.unitPrice) || 0;
    const totalAmount = body.totalAmount ? Number(body.totalAmount) : quantity * unitPrice;
    const purchase = await db.purchase.create({
      data: {
        supplierName: String(body.supplierName ?? "").trim(),
        productName: String(body.productName ?? "").trim(),
        quantity,
        unitPrice,
        totalAmount,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
        notes: body.notes ? String(body.notes).trim() : null,
      },
    });
    // Optional: bump product stock if a matching product exists (case-insensitive name match)
    if (body.autoStock !== false) {
      const all = await db.product.findMany();
      const existing = all.find(
        (p) => p.name.toLowerCase() === purchase.productName.toLowerCase()
      );
      if (existing) {
        await db.product.update({
          where: { id: existing.id },
          data: { quantity: { increment: purchase.quantity } },
        });
      }
    }
    return NextResponse.json(purchase, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create purchase" },
      { status: 400 }
    );
  }
}
