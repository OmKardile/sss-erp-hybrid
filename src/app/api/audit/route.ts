import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns a unified audit timeline of all record-creating and record-deleting actions:
// sales, purchases, income, expenses, udhar + payments, adjustments.
// Each event is normalized to: { id, type, action, title, subtitle, amount, date, tone }
export async function GET() {
  const [sales, purchases, income, expenses, udhars, payments, adjustments, products] = await Promise.all([
    db.sale.findMany({ include: { items: true }, orderBy: { createdAt: "desc" }, take: 30 }),
    db.purchase.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.income.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.expense.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.udhar.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.udharPayment.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    db.adjustment.findMany({ orderBy: { date: "desc" }, take: 20 }),
    db.product.findMany({ orderBy: { updatedAt: "desc" }, take: 15 }),
  ]);

  type Event = {
    id: string;
    type: string;
    action: "created" | "updated" | "deleted" | "adjusted" | "paid";
    title: string;
    subtitle: string;
    amount?: number;
    date: string;
    tone: "emerald" | "rose" | "amber" | "violet" | "teal" | "cyan";
  };

  const events: Event[] = [];

  sales.forEach((s) => {
    events.push({
      id: `sale-${s.id}`,
      type: "Sale",
      action: "created",
      title: s.customerName ? `Sale to ${s.customerName}` : "Counter Sale",
      subtitle: `${s.itemCount} item(s) · ${s.paymentMethod}${s.taxAmount > 0 ? ` · tax ₹${s.taxAmount}` : ""}`,
      amount: s.total,
      date: s.createdAt.toISOString(),
      tone: "emerald",
    });
  });

  purchases.forEach((p) => {
    events.push({
      id: `pur-${p.id}`,
      type: "Purchase",
      action: "created",
      title: `Purchased ${p.productName}`,
      subtitle: `${p.supplierName} · ${p.quantity} units`,
      amount: -p.totalAmount,
      date: p.createdAt.toISOString(),
      tone: "amber",
    });
  });

  income.forEach((i) => {
    events.push({
      id: `inc-${i.id}`,
      type: "Income",
      action: "created",
      title: i.source,
      subtitle: i.category,
      amount: i.amount,
      date: i.createdAt.toISOString(),
      tone: "emerald",
    });
  });

  expenses.forEach((e) => {
    events.push({
      id: `exp-${e.id}`,
      type: "Expense",
      action: "created",
      title: e.category,
      subtitle: e.notes || "Expense",
      amount: -e.amount,
      date: e.createdAt.toISOString(),
      tone: "rose",
    });
  });

  udhars.forEach((u) => {
    events.push({
      id: `udh-${u.id}`,
      type: "Udhar",
      action: "created",
      title: `Udhar to ${u.customerName}`,
      subtitle: u.description,
      amount: u.amount,
      date: u.createdAt.toISOString(),
      tone: "violet",
    });
  });

  payments.forEach((p) => {
    events.push({
      id: `pay-${p.id}`,
      type: "Payment",
      action: "paid",
      title: `Payment received`,
      subtitle: p.notes || "Udhar settlement",
      amount: p.amount,
      date: p.createdAt.toISOString(),
      tone: "teal",
    });
  });

  adjustments.forEach((a) => {
    events.push({
      id: `adj-${a.id}`,
      type: "Adjustment",
      action: "adjusted",
      title: `Stock adjusted: ${a.productName}`,
      subtitle: `${a.oldQty} → ${a.newQty} (${a.diff > 0 ? "+" : ""}${a.diff}) · ${a.reason}`,
      date: a.date.toISOString(),
      tone: "cyan",
    });
  });

  // Sort by date descending
  events.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  // Summary counts by type
  const counts: Record<string, number> = {};
  events.forEach((e) => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });

  return NextResponse.json({
    events: events.slice(0, 50),
    total: events.length,
    counts,
  });
}
