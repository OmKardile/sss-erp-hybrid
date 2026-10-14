import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns a full ledger for a supplier: all purchases made from them,
// sorted chronologically with a running total.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await db.supplier.findUnique({ where: { id } });
  if (!supplier) {
    return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
  }
  const name = supplier.name;

  // All purchases from this supplier (matched by name)
  const purchases = await db.purchase.findMany({
    where: { supplierName: name },
    orderBy: { purchaseDate: "asc" },
  });

  // Build transaction list with running total
  type Txn = {
    id: string;
    type: "purchase";
    date: string;
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
    runningTotal: number;
    notes?: string | null;
  };

  let running = 0;
  const transactions: Txn[] = purchases.map((p) => {
    running += p.totalAmount;
    return {
      id: p.id,
      type: "purchase",
      date: p.purchaseDate.toISOString(),
      product: p.productName,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: p.totalAmount,
      runningTotal: running,
      notes: p.notes,
    };
  });

  const totalSpend = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalUnits = purchases.reduce((s, p) => s + p.quantity, 0);
  const avgOrderValue = purchases.length > 0 ? totalSpend / purchases.length : 0;
  const lastOrderDate = purchases.length > 0 ? purchases[purchases.length - 1].purchaseDate : null;

  // Top products bought from this supplier
  const productMap = new Map<string, { name: string; qty: number; total: number; count: number }>();
  purchases.forEach((p) => {
    const key = p.productName;
    const cur = productMap.get(key) || { name: p.productName, qty: 0, total: 0, count: 0 };
    cur.qty += p.quantity;
    cur.total += p.totalAmount;
    cur.count += 1;
    productMap.set(key, cur);
  });
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    supplier,
    summary: {
      totalSpend,
      orderCount: purchases.length,
      totalUnits,
      avgOrderValue,
      lastOrderDate: lastOrderDate ? lastOrderDate.toISOString() : null,
    },
    transactions,
    topProducts,
  });
}
