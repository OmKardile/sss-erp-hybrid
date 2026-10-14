import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — list all adjustments (audit log)
export async function GET() {
  const adjustments = await db.adjustment.findMany({ orderBy: { date: "desc" } });
  return NextResponse.json(adjustments);
}

// POST — record a stock adjustment for a product (updates product quantity + logs the change)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const productId = String(body.productId || "").trim();
    const newQty = Number(body.newQty);
    const reason = String(body.reason || "Stock-take").trim();
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }
    if (Number.isNaN(newQty) || newQty < 0) {
      return NextResponse.json({ error: "newQty must be a non-negative number" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const oldQty = product.quantity;
    const diff = newQty - oldQty;

    const [updated, adjustment] = await db.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id: productId },
        data: { quantity: newQty },
      });
      const adjustment = await tx.adjustment.create({
        data: {
          productId,
          productName: product.name,
          oldQty,
          newQty,
          diff,
          reason,
          notes,
        },
      });
      return [updated, adjustment] as const;
    });

    return NextResponse.json({ product: updated, adjustment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record adjustment" },
      { status: 400 }
    );
  }
}
