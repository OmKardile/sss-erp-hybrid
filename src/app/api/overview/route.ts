import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [income, expenses, purchases, products, udhars] = await Promise.all([
    db.income.findMany(),
    db.expense.findMany(),
    db.purchase.findMany(),
    db.product.findMany(),
    db.udhar.findMany({ include: { payments: true } }),
  ]);

  const monthlyData = new Map<
    string,
    { income: number; expenses: number; purchases: number; profit: number }
  >();
  const ensure = (m: string) => {
    if (!monthlyData.has(m))
      monthlyData.set(m, { income: 0, expenses: 0, purchases: 0, profit: 0 });
    return monthlyData.get(m)!;
  };
  income.forEach((i) => (ensure(i.date.toISOString().substring(0, 7)).income += i.amount));
  expenses.forEach((e) => (ensure(e.date.toISOString().substring(0, 7)).expenses += e.amount));
  purchases.forEach(
    (p) => (ensure(p.purchaseDate.toISOString().substring(0, 7)).purchases += p.totalAmount)
  );
  const overview = Array.from(monthlyData.entries())
    .map(([month, v]) => ({ month, ...v, profit: v.income - v.expenses - v.purchases }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Yearly roll-up
  const yearlyMap = new Map<string, { income: number; expenses: number; purchases: number; profit: number }>();
  overview.forEach((m) => {
    const year = m.month.substring(0, 4);
    if (!yearlyMap.has(year))
      yearlyMap.set(year, { income: 0, expenses: 0, purchases: 0, profit: 0 });
    const y = yearlyMap.get(year)!;
    y.income += m.income;
    y.expenses += m.expenses;
    y.purchases += m.purchases;
    y.profit += m.profit;
  });
  const yearly = Array.from(yearlyMap.entries()).map(([year, v]) => ({ year, ...v }));

  // Category breakdowns
  const incomeCatMap = new Map<string, number>();
  income.forEach((i) => incomeCatMap.set(i.category, (incomeCatMap.get(i.category) || 0) + i.amount));
  const expenseCatMap = new Map<string, number>();
  expenses.forEach((e) => expenseCatMap.set(e.category, (expenseCatMap.get(e.category) || 0) + e.amount));

  // Udhar summary
  let totalUdhar = 0;
  let settledUdhar = 0;
  let outstandingUdhar = 0;
  udhars.forEach((u) => {
    const paid = u.payments.reduce((s, p) => s + p.amount, 0);
    totalUdhar += u.amount;
    settledUdhar += Math.min(paid, u.amount);
    outstandingUdhar += Math.max(0, u.amount - paid);
  });

  // Top suppliers & customers
  const supplierMap = new Map<string, { count: number; total: number }>();
  purchases.forEach((p) => {
    if (!supplierMap.has(p.supplierName)) supplierMap.set(p.supplierName, { count: 0, total: 0 });
    const s = supplierMap.get(p.supplierName)!;
    s.count += 1;
    s.total += p.totalAmount;
  });
  const topSuppliers = Array.from(supplierMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const customerMap = new Map<string, { count: number; total: number }>();
  udhars.forEach((u) => {
    if (!customerMap.has(u.customerName)) customerMap.set(u.customerName, { count: 0, total: 0 });
    const c = customerMap.get(u.customerName)!;
    c.count += 1;
    c.total += u.amount;
  });
  const topCustomers = Array.from(customerMap.entries())
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const totalInventoryValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);

  return NextResponse.json({
    monthly: overview,
    yearly,
    incomeCategories: Array.from(incomeCatMap.entries()).map(([name, value]) => ({ name, value })),
    expenseCategories: Array.from(expenseCatMap.entries()).map(([name, value]) => ({ name, value })),
    udharSummary: { total: totalUdhar, settled: settledUdhar, outstanding: outstandingUdhar },
    topSuppliers,
    topCustomers,
    totalInventoryValue,
    productCount: products.length,
  });
}
