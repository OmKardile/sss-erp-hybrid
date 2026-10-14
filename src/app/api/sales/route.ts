import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface SaleItemInput {
  productId: string;
  name: string;
  price: number; // selling price per unit
  quantity: number;
}

// Records a sale: decrements product stock, creates an Income entry, AND stores a Sale record with line items.
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

    // Tax: read from settings (taxEnabled + taxRate), unless overridden in body
    let taxRate = 0;
    let taxEnabled = false;
    if (typeof body.taxRate === "number") {
      taxRate = body.taxRate;
      taxEnabled = taxRate > 0;
    } else {
      const settings = await db.setting.findMany();
      const get = (k: string) => settings.find((s) => s.key === k)?.value;
      taxEnabled = get("taxEnabled") === "true";
      taxRate = Number(get("taxRate")) || 0;
    }
    const applyTax = taxEnabled && taxRate > 0;

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
    const discounted = Math.max(0, subtotal - discount);
    const taxAmount = applyTax ? +(discounted * (taxRate / 100)).toFixed(2) : 0;
    const total = +(discounted + taxAmount).toFixed(2);

    // Transaction: decrement stock + create income + create sale + sale items
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
          notes: `POS sale · ${paymentMethod} · ${items.length} item(s)${applyTax ? ` · tax ${taxRate}%` : ""}${notes ? ` · ${notes}` : ""}`,
        },
      });
      const sale = await tx.sale.create({
        data: {
          customerName,
          paymentMethod,
          subtotal,
          discount,
          total,
          itemCount: items.length,
          notes,
          date: saleDate,
          incomeId: income.id,
          items: {
            create: items.map((it) => ({
              productId: it.productId,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              lineTotal: it.price * it.quantity,
            })),
          },
        },
        include: { items: true },
      });
      return { income, sale, subtotal, total, discount, taxRate, taxAmount };
    });

    return NextResponse.json(
      {
        success: true,
        receipt: {
          items: items.map((it) => ({ ...it, lineTotal: it.price * it.quantity })),
          subtotal,
          discount,
          taxRate: applyTax ? taxRate : 0,
          taxAmount,
          total,
          customerName,
          paymentMethod,
          date: saleDate.toISOString(),
          incomeId: result.income.id,
          saleId: result.sale.id,
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

// GET — list recent sales (with optional ?limit=)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
  const sales = await db.sale.findMany({
    include: { items: true },
    orderBy: { date: "desc" },
    take: limit,
  });
  return NextResponse.json(sales);
}
