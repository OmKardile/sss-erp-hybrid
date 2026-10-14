import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns products at or below their min-stock alert, with restock suggestions.
export async function GET() {
  const products = await db.product.findMany({
    orderBy: [{ quantity: "asc" }, { name: "asc" }],
  });

  const lowStock = products
    .filter((p) => p.quantity <= p.minStockAlert)
    .map((p) => {
      // Suggested restock: enough to reach 3x the min-stock alert, or at least the deficit × 2
      const target = Math.max(p.minStockAlert * 3, p.minStockAlert + 5);
      const suggestedQty = Math.max(0, Math.ceil(target - p.quantity));
      const deficit = Math.max(0, p.minStockAlert - p.quantity);
      const severity = p.quantity <= 0 ? "out" : p.quantity <= p.minStockAlert * 0.5 ? "critical" : "low";
      return {
        ...p,
        deficit,
        suggestedQty,
        estRestockCost: suggestedQty * p.purchasePrice,
        severity,
      };
    });

  const outOfStock = lowStock.filter((p) => p.severity === "out").length;
  const critical = lowStock.filter((p) => p.severity === "critical").length;
  const totalRestockCost = lowStock.reduce((s, p) => s + p.estRestockCost, 0);
  const inventoryValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);

  return NextResponse.json({
    items: lowStock,
    summary: {
      total: products.length,
      lowStockCount: lowStock.length,
      outOfStock,
      critical,
      totalRestockCost,
      inventoryValue,
    },
  });
}
