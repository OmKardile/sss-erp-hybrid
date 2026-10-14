import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, purchases, income, expenses, udhars, customers, suppliers] = await Promise.all([
    db.product.findMany(),
    db.purchase.findMany(),
    db.income.findMany(),
    db.expense.findMany(),
    db.udhar.findMany({ include: { payments: true } }),
    db.customer.findMany(),
    db.supplier.findMany(),
  ]);

  const totalIncome = income.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalPurchases = purchases.reduce((s, p) => s + p.totalAmount, 0);
  const inventoryValue = products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0);
  const lowStock = products.filter((p) => p.quantity <= p.minStockAlert);
  const outstandingUdhar = udhars.reduce((s, u) => {
    const paid = u.payments.reduce((sp, p) => sp + p.amount, 0);
    return s + Math.max(0, u.amount - paid);
  }, 0);

  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalIncome,
      totalExpenses,
      totalPurchases,
      netProfit: totalIncome - totalExpenses - totalPurchases,
      inventoryValue,
      outstandingUdhar,
      productCount: products.length,
      customerCount: customers.length,
      supplierCount: suppliers.length,
    },
    products,
    purchases,
    income,
    expenses,
    udhars: udhars.map((u) => ({
      ...u,
      paidAmount: u.payments.reduce((s, p) => s + p.amount, 0),
      remainingAmount: Math.max(0, u.amount - u.payments.reduce((s, p) => s + p.amount, 0)),
    })),
    lowStock,
    customers,
    suppliers,
  };

  return NextResponse.json(report);
}
