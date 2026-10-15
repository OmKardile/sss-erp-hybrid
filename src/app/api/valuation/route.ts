import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — inventory valuation using the specified method.
// Methods: "purchase" (current purchase price × qty), "selling" (selling price × qty),
//          "weighted_avg" (average of purchase prices, same as purchase for flat schema), "fifo" (approximation).
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const method = searchParams.get("method") || "purchase";

  const products = await db.product.findMany();
  const purchases = await db.purchase.findMany({ orderBy: { purchaseDate: "asc" } });

  let inventoryValue = 0;
  let potentialRevenue = 0;
  let totalUnits = 0;
  const breakdown: any[] = [];

  if (method === "fifo") {
    // FIFO approximation: for each product, match oldest purchases first.
    // Build a per-product queue of (qty, unitPrice) from purchases.
    const productQueues = new Map<string, { qty: number; price: number }[]>();
    purchases.forEach((p) => {
      if (!productQueues.has(p.productName)) productQueues.set(p.productName, []);
      productQueues.get(p.productName)!.push({ qty: p.quantity, price: p.unitPrice });
    });

    for (const p of products) {
      const queue = (productQueues.get(p.name) || []).slice(); // copy
      let remaining = p.quantity;
      let value = 0;
      while (remaining > 0 && queue.length > 0) {
        const layer = queue[0];
        const take = Math.min(remaining, layer.qty);
        value += take * layer.price;
        remaining -= take;
        layer.qty -= take;
        if (layer.qty <= 0) queue.shift();
      }
      // If remaining > 0 (stock exceeds purchase history), use current purchasePrice
      if (remaining > 0) value += remaining * p.purchasePrice;
      inventoryValue += value;
      potentialRevenue += p.sellingPrice * p.quantity;
      totalUnits += p.quantity;
      breakdown.push({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unitType: p.unitType,
        value: Math.round(value * 100) / 100,
        avgPrice: p.quantity > 0 ? Math.round((value / p.quantity) * 100) / 100 : p.purchasePrice,
        sellingValue: p.sellingPrice * p.quantity,
      });
    }
  } else if (method === "selling") {
    for (const p of products) {
      const v = p.sellingPrice * p.quantity;
      inventoryValue += v;
      potentialRevenue += v;
      totalUnits += p.quantity;
      breakdown.push({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unitType: p.unitType,
        value: Math.round(v * 100) / 100,
        avgPrice: p.sellingPrice,
        sellingValue: v,
      });
    }
  } else {
    // "purchase" (default) — also acts as weighted_avg since we store a single purchasePrice
    for (const p of products) {
      const v = p.purchasePrice * p.quantity;
      inventoryValue += v;
      potentialRevenue += p.sellingPrice * p.quantity;
      totalUnits += p.quantity;
      breakdown.push({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        unitType: p.unitType,
        value: Math.round(v * 100) / 100,
        avgPrice: p.purchasePrice,
        sellingValue: p.sellingPrice * p.quantity,
      });
    }
  }

  const potentialProfit = potentialRevenue - inventoryValue;

  return NextResponse.json({
    method,
    summary: {
      inventoryValue: Math.round(inventoryValue * 100) / 100,
      potentialRevenue: Math.round(potentialRevenue * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      totalUnits,
      productCount: products.length,
    },
    breakdown: breakdown.sort((a, b) => b.value - a.value),
  });
}
