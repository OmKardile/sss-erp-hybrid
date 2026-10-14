import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Today's sales summary for the dashboard widget
export async function GET() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const todaySales = await db.sale.findMany({
    where: { date: { gte: new Date(`${todayStr}T00:00:00.000Z`) } },
    include: { items: true },
    orderBy: { date: "desc" },
  });

  const total = todaySales.reduce((s, sale) => s + sale.total, 0);
  const itemCount = todaySales.reduce((s, sale) => s + sale.itemCount, 0);
  const unitsSold = todaySales.reduce(
    (s, sale) => s + sale.items.reduce((si, it) => si + it.quantity, 0),
    0
  );

  // Payment method breakdown for today
  const paymentMap = new Map<string, { count: number; total: number }>();
  todaySales.forEach((s) => {
    const cur = paymentMap.get(s.paymentMethod) || { count: 0, total: 0 };
    cur.count += 1;
    cur.total += s.total;
    paymentMap.set(s.paymentMethod, cur);
  });
  const paymentBreakdown = Array.from(paymentMap.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.total - a.total);

  // Top product today
  const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
  todaySales.forEach((s) => {
    s.items.forEach((it) => {
      const key = it.productId || it.name;
      const cur = productMap.get(key) || { name: it.name, qty: 0, revenue: 0 };
      cur.qty += it.quantity;
      cur.revenue += it.lineTotal;
      productMap.set(key, cur);
    });
  });
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return NextResponse.json({
    date: todayStr,
    count: todaySales.length,
    total,
    itemCount,
    unitsSold,
    paymentBreakdown,
    topProducts,
    recent: todaySales.slice(0, 5).map((s) => ({
      id: s.id,
      customerName: s.customerName,
      paymentMethod: s.paymentMethod,
      total: s.total,
      itemCount: s.itemCount,
      time: s.date.toISOString(),
    })),
  });
}
