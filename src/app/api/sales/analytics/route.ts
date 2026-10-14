import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Sales analytics: top products, daily totals, payment-method breakdown, sales trend
export async function GET() {
  const sales = await db.sale.findMany({
    include: { items: true },
    orderBy: { date: "desc" },
  });

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const monthStr = todayStr.substring(0, 7);

  // Totals
  const todaySales = sales.filter((s) => s.date.toISOString().split("T")[0] === todayStr);
  const monthSales = sales.filter((s) => s.date.toISOString().startsWith(monthStr));
  const allTimeTotal = sales.reduce((sum, s) => sum + s.total, 0);
  const todayTotal = todaySales.reduce((sum, s) => sum + s.total, 0);
  const monthTotal = monthSales.reduce((sum, s) => sum + s.total, 0);
  const todayCount = todaySales.length;
  const monthCount = monthSales.length;

  // Average sale value
  const avgSaleValue = sales.length > 0 ? allTimeTotal / sales.length : 0;

  // Top products by revenue
  const productMap = new Map<string, { name: string; quantity: number; revenue: number; count: number }>();
  sales.forEach((s) => {
    s.items.forEach((it) => {
      const key = it.productId || it.name;
      const cur = productMap.get(key) || { name: it.name, quantity: 0, revenue: 0, count: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.lineTotal;
      cur.count += 1;
      productMap.set(key, cur);
    });
  });
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Payment method breakdown
  const paymentMap = new Map<string, { count: number; total: number }>();
  sales.forEach((s) => {
    const cur = paymentMap.get(s.paymentMethod) || { count: 0, total: 0 };
    cur.count += 1;
    cur.total += s.total;
    paymentMap.set(s.paymentMethod, cur);
  });
  const paymentBreakdown = Array.from(paymentMap.entries())
    .map(([method, v]) => ({ method, ...v }))
    .sort((a, b) => b.total - a.total);

  // Daily sales trend (last 14 days)
  const trendMap = new Map<string, { date: string; total: number; count: number }>();
  sales.forEach((s) => {
    const d = s.date.toISOString().split("T")[0];
    const cur = trendMap.get(d) || { date: d, total: 0, count: 0 };
    cur.total += s.total;
    cur.count += 1;
    trendMap.set(d, cur);
  });
  // Fill in missing last-14-days
  const dailyTrend: { date: string; total: number; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const v = trendMap.get(key) || { date: key, total: 0, count: 0 };
    dailyTrend.push(v);
  }

  // Hourly distribution (today)
  const hourlyMap = new Map<number, number>();
  todaySales.forEach((s) => {
    const h = new Date(s.date).getHours();
    hourlyMap.set(h, (hourlyMap.get(h) || 0) + s.total);
  });
  const hourly: { hour: string; total: number }[] = [];
  for (let h = 8; h <= 21; h++) {
    hourly.push({ hour: `${h % 12 || 12}${h < 12 ? "a" : "p"}`, total: hourlyMap.get(h) || 0 });
  }

  // Top customers
  const customerMap = new Map<string, { count: number; total: number }>();
  sales.forEach((s) => {
    if (!s.customerName) return;
    const cur = customerMap.get(s.customerName) || { count: 0, total: 0 };
    cur.count += 1;
    cur.total += s.total;
    customerMap.set(s.customerName, cur);
  });
  const topCustomers = Array.from(customerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return NextResponse.json({
    summary: {
      todayTotal,
      todayCount,
      monthTotal,
      monthCount,
      allTimeTotal,
      allTimeCount: sales.length,
      avgSaleValue,
    },
    topProducts,
    paymentBreakdown,
    dailyTrend,
    hourly,
    topCustomers,
    recentSales: sales.slice(0, 8).map((s) => ({
      id: s.id,
      customerName: s.customerName,
      paymentMethod: s.paymentMethod,
      total: s.total,
      itemCount: s.itemCount,
      date: s.date.toISOString(),
    })),
  });
}
