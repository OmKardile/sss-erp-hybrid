import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns a composite Business Health Score (0-100) based on multiple dimensions:
// - Profitability (profit margin & trend)
// - Liquidity (cash flow)
// - Inventory health (low stock %, stock value)
// - Credit risk (outstanding udhar %)
// - Sales momentum (target progress)
export async function GET() {
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const currentMonth = todayStr.substring(0, 7);

  const [income, expenses, purchases, products, udhars, sales, targets] = await Promise.all([
    db.income.findMany(),
    db.expense.findMany(),
    db.purchase.findMany(),
    db.product.findMany(),
    db.udhar.findMany({ include: { payments: true } }),
    db.sale.findMany(),
    db.target.findMany(),
  ]);

  // --- 1. Profitability (30 pts) ---
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
  const margin = monthlyIncome > 0 ? (monthlyProfit / monthlyIncome) * 100 : 0;
  // 30 pts if margin >= 20%, scale down to 0 at margin <= 0%
  const profitabilityScore = Math.max(0, Math.min(30, (margin / 20) * 30));

  // --- 2. Liquidity / Cash Flow (20 pts) ---
  const allTimeIncome = income.reduce((s, i) => s + i.amount, 0);
  const allTimeExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const allTimePurchases = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const netCashFlow = allTimeIncome - allTimeExpenses - allTimePurchases;
  const liquidityScore = netCashFlow > 0 ? 20 : Math.max(0, 20 + (netCashFlow / 10000) * 5);

  // --- 3. Inventory Health (20 pts) ---
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.quantity <= p.minStockAlert).length;
  const outOfStock = products.filter((p) => p.quantity <= 0).length;
  const stockHealthPct = totalProducts > 0 ? ((totalProducts - lowStock) / totalProducts) * 100 : 100;
  const inventoryScore = Math.max(0, (stockHealthPct / 100) * 20);

  // --- 4. Credit Risk (15 pts) — lower outstanding udhar is better ---
  let totalUdhar = 0;
  let outstandingUdhar = 0;
  udhars.forEach((u) => {
    const paid = u.payments.reduce((s, p) => s + p.amount, 0);
    totalUdhar += u.amount;
    outstandingUdhar += Math.max(0, u.amount - paid);
  });
  const outstandingPct = totalUdhar > 0 ? (outstandingUdhar / totalUdhar) * 100 : 0;
  const creditScore = Math.max(0, 15 - (outstandingPct / 100) * 15);

  // --- 5. Sales Momentum (15 pts) — target progress vs expected pace ---
  const currentTarget = targets.find((t) => t.month === currentMonth);
  let momentumScore = 7.5; // default mid if no target
  if (currentTarget) {
    const monthSales = sales.filter((s) => s.date.toISOString().startsWith(currentMonth));
    const actual = monthSales.reduce((s, sale) => s + sale.total, 0);
    const pct = currentTarget.amount > 0 ? (actual / currentTarget.amount) * 100 : 0;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const expectedPace = (dayOfMonth / daysInMonth) * 100;
    momentumScore = Math.max(0, Math.min(15, (pct / Math.max(1, expectedPace)) * 7.5));
  }

  const totalScore = Math.round(
    profitabilityScore + liquidityScore + inventoryScore + creditScore + momentumScore
  );

  // Determine grade
  let grade: string;
  let gradeTone: string;
  if (totalScore >= 85) { grade = "A+"; gradeTone = "emerald"; }
  else if (totalScore >= 75) { grade = "A"; gradeTone = "emerald"; }
  else if (totalScore >= 65) { grade = "B+"; gradeTone = "teal"; }
  else if (totalScore >= 55) { grade = "B"; gradeTone = "teal"; }
  else if (totalScore >= 45) { grade = "C"; gradeTone = "amber"; }
  else if (totalScore >= 30) { grade = "D"; gradeTone = "rose"; }
  else { grade = "F"; gradeTone = "rose"; }

  return NextResponse.json({
    score: totalScore,
    grade,
    gradeTone,
    breakdown: {
      profitability: { score: Math.round(profitabilityScore), max: 30, margin: Math.round(margin * 10) / 10 },
      liquidity: { score: Math.round(liquidityScore), max: 20, netCashFlow },
      inventory: { score: Math.round(inventoryScore), max: 20, lowStock, outOfStock, total: totalProducts },
      credit: { score: Math.round(creditScore), max: 15, outstanding: outstandingUdhar, total: totalUdhar },
      momentum: { score: Math.round(momentumScore), max: 15, hasTarget: !!currentTarget },
    },
    summary: {
      monthlyProfit,
      monthlyIncome,
      netCashFlow,
      outstandingUdhar,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
    },
  });
}
