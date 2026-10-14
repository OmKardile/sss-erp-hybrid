import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function inRange(date: Date, from: string | null, to: string | null): boolean {
  const d = date.toISOString().split("T")[0];
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // Optional custom date range: ?from=2026-10-01&to=2026-10-15
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const useCustomRange = !!(from || to);

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = todayStr.substring(0, 7);

  const [income, expenses, purchases, products, udhars, payments] = await Promise.all([
    db.income.findMany(),
    db.expense.findMany(),
    db.purchase.findMany(),
    db.product.findMany(),
    db.udhar.findMany({ include: { payments: true } }),
    db.udharPayment.findMany(),
  ]);

  // Range-scoped figures (used when a custom range is set)
  const rangeIncome = useCustomRange
    ? income.filter((i) => inRange(i.date, from, to)).reduce((s, i) => s + i.amount, 0)
    : 0;
  const rangeExpenses = useCustomRange
    ? expenses.filter((e) => inRange(e.date, from, to)).reduce((s, e) => s + e.amount, 0)
    : 0;
  const rangePurchases = useCustomRange
    ? purchases.filter((p) => inRange(p.purchaseDate, from, to)).reduce((s, p) => s + p.totalAmount, 0)
    : 0;
  const rangeProfit = rangeIncome - rangeExpenses - rangePurchases;
  const rangeTxnCount = useCustomRange
    ? income.filter((i) => inRange(i.date, from, to)).length +
      expenses.filter((e) => inRange(e.date, from, to)).length +
      purchases.filter((p) => inRange(p.purchaseDate, from, to)).length
    : 0;

  const todayIncome = income
    .filter((i) => i.date.toISOString().split("T")[0] === todayStr)
    .reduce((s, i) => s + i.amount, 0);
  const todayExpenses = expenses
    .filter((e) => e.date.toISOString().split("T")[0] === todayStr)
    .reduce((s, e) => s + e.amount, 0);

  const monthlyIncome = income
    .filter((i) => i.date.toISOString().startsWith(currentMonth))
    .reduce((s, i) => s + i.amount, 0);
  const monthlyExpenses = expenses
    .filter((e) => e.date.toISOString().startsWith(currentMonth))
    .reduce((s, e) => s + e.amount, 0);
  const monthlyPurchases = purchases
    .filter((p) => p.purchaseDate.toISOString().startsWith(currentMonth))
    .reduce((s, p) => s + p.totalAmount, 0);

  const monthlyProfit = monthlyIncome - monthlyExpenses - monthlyPurchases;
  const inventoryValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const lowStockCount = products.filter((p) => p.quantity <= p.minStockAlert).length;

  const pendingUdhars = udhars.filter((u) => u.status !== "PAID");
  let pendingUdhar = 0;
  for (const u of pendingUdhars) {
    const paid = u.payments.reduce((s, p) => s + p.amount, 0);
    pendingUdhar += Math.max(0, u.amount - paid);
  }

  const summary = {
    todayIncome,
    todayExpenses,
    monthlyIncome,
    monthlyExpenses,
    monthlyPurchases,
    monthlyProfit,
    inventoryValue,
    inventoryCount: products.reduce((s, p) => s + p.quantity, 0),
    lowStockCount,
    pendingUdhar,
    pendingUdharCount: pendingUdhars.length,
    totalProducts: products.length,
    // Custom-range figures (zero when no range requested)
    range: useCustomRange
      ? {
          from,
          to,
          income: rangeIncome,
          expenses: rangeExpenses,
          purchases: rangePurchases,
          profit: rangeProfit,
          txnCount: rangeTxnCount,
        }
      : null,
  };

  // ---- Charts ----
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const incomeMap = new Map<string, number>();
  income
    .filter((i) => i.date >= thirtyDaysAgo)
    .forEach((i) => {
      const k = i.date.toISOString().split("T")[0];
      incomeMap.set(k, (incomeMap.get(k) || 0) + i.amount);
    });
  const last30DaysIncome = Array.from(incomeMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const expenseDistMap = new Map<string, number>();
  expenses.forEach((e) => {
    expenseDistMap.set(e.category, (expenseDistMap.get(e.category) || 0) + e.amount);
  });
  const expenseDistribution = Array.from(expenseDistMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyData = new Map<string, { income: number; expenses: number; purchases: number }>();
  const ensure = (m: string) => {
    if (!monthlyData.has(m)) monthlyData.set(m, { income: 0, expenses: 0, purchases: 0 });
    return monthlyData.get(m)!;
  };
  income
    .filter((i) => i.date >= sixMonthsAgo)
    .forEach((i) => ensure(i.date.toISOString().substring(0, 7)).income += i.amount);
  expenses
    .filter((e) => e.date >= sixMonthsAgo)
    .forEach((e) => ensure(e.date.toISOString().substring(0, 7)).expenses += e.amount);
  purchases
    .filter((p) => p.purchaseDate >= sixMonthsAgo)
    .forEach((p) => ensure(p.purchaseDate.toISOString().substring(0, 7)).purchases += p.totalAmount);
  const monthlyComparison = Array.from(monthlyData.entries())
    .map(([month, v]) => ({ month, ...v, profit: v.income - v.expenses - v.purchases }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topProducts = [...products]
    .map((p) => ({ name: p.name, stock: p.quantity, value: p.purchasePrice * p.quantity }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const inflow = income.reduce((s, i) => s + i.amount, 0);
  const outflow =
    expenses.reduce((s, e) => s + e.amount, 0) + purchases.reduce((s, p) => s + p.totalAmount, 0);
  const cashFlow = { inflow, outflow, net: inflow - outflow };

  const charts = {
    last30DaysIncome,
    expenseDistribution,
    monthlyComparison,
    topProducts,
    cashFlow,
  };

  return NextResponse.json({ summary, charts });
}
