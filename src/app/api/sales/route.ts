import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface SaleItemInput {
  productId: string;
  name: string;
  price: number; // selling price per unit
  quantity: number;
}

// Records a sale: decrements product stock, creates an Income entry, and stores a Sale record.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const items: SaleItemInput[] = Array.isArray(body.items) ? body.items : [];
    if (items.length === 0) {
      return NextResponse.json({ error: "No sale items provided" }, { status: 400 });
    }
    const customerName: string | null = body.customerName ? String(body.customerName).trim() : null;
    const paymentMethod: string = String(body.paymentMethod ?? "Cash");
    const saleDate: Date = body.date ? new Date(body.date) : new Date();
    const discount: number = Number(body.discount) || 0;
    const notes: string | null = body.notes ? String(body.notes).trim() : null;

    // Validate stock levels
    for (const it of items) {
      const product = await db.product.findUnique({ where: { id: it.productId } });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${it.name}` }, { status: 400 });
      }
      if (product.quantity < it.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.quantity}` },
          { status: 400 }
        );
      }
    }

    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const total = Math.max(0, subtotal - discount);

    // Transaction: decrement stock + create income
    const result = await db.$transaction(async (tx) => {
      for (const it of items) {
        await tx.product.update({
          where: { id: it.productId },
          data: { quantity: { decrement: it.quantity } },
        });
      }
      const income = await tx.income.create({
        data: {
          source: customerName ? `Sale to ${customerName}` : "Counter Sale",
          category: "Sales",
          amount: total,
          date: saleDate,
          notes: `POS sale · ${paymentMethod} · ${items.length} item(s)${notes ? ` · ${notes}` : ""}`,
        },
      });
      return { income, subtotal, total, discount };
    });

    return NextResponse.json(
      {
        success: true,
        receipt: {
          items: items.map((it) => ({ ...it, lineTotal: it.price * it.quantity })),
          subtotal,
          discount,
          total,
          customerName,
          paymentMethod,
          date: saleDate.toISOString(),
          incomeId: result.income.id,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record sale" },
      { status: 400 }
    );
  }
}
