import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Returns a full ledger for a customer: udhar entries, payments, and POS sales,
// sorted chronologically with a running balance.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  const name = customer.name;

  // Gather all udhar entries for this customer (matched by name)
  const udhars = await db.udhar.findMany({
    where: { customerName: name },
    include: { payments: { orderBy: { date: "asc" } } },
    orderBy: { date: "asc" },
  });

  // Gather POS sales to this customer
  const sales = await db.sale.findMany({
    where: { customerName: name },
    include: { items: true },
    orderBy: { date: "asc" },
  });

  // Build a unified transaction list with running balance
  type Txn = {
    id: string;
    type: "credit" | "payment" | "sale";
    date: string;
    description: string;
    debit: number; // amount owed / sale value (increases customer's obligation or purchase)
    credit: number; // amount paid / settled
    balance: number;
    refId?: string;
  };

  const txns: Omit<Txn, "balance">[] = [];

  // Credit entries (udhar given) — debit the customer
  udhars.forEach((u) => {
    txns.push({
      id: `udh-${u.id}`,
      type: "credit",
      date: u.date.toISOString(),
      description: u.description,
      debit: u.amount,
      credit: 0,
      refId: u.id,
    });
    // Payments — credit the customer
    u.payments.forEach((p) => {
      txns.push({
        id: `pay-${p.id}`,
        type: "payment",
        date: p.date.toISOString(),
        description: `Payment${p.notes ? ` · ${p.notes}` : ""}`,
        debit: 0,
        credit: p.amount,
        refId: p.id,
      });
    });
  });

  // POS sales — debit (customer bought items, amount owed if not paid)
  sales.forEach((s) => {
    txns.push({
      id: `sale-${s.id}`,
      type: "sale",
      date: s.date.toISOString(),
      description: `POS Sale · ${s.itemCount} item(s) · ${s.paymentMethod}`,
      debit: s.total,
      credit: s.total, // POS sales are settled at point of sale (cash/upi), so credit = debit
      refId: s.id,
    });
  });

  // Sort chronologically
  txns.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  // Compute running balance (cumulative debit - credit) — represents outstanding udhar
  let running = 0;
  const withBalance: Txn[] = txns.map((t) => {
    running += t.debit - t.credit;
    return { ...t, balance: running };
  });

  const totalCreditGiven = udhars.reduce((s, u) => s + u.amount, 0);
  const totalPaid = udhars.reduce((s, u) => s + u.payments.reduce((sp, p) => sp + p.amount, 0), 0);
  const outstanding = Math.max(0, totalCreditGiven - totalPaid);
  const salesTotal = sales.reduce((s, sale) => s + sale.total, 0);
  const pendingUdharCount = udhars.filter((u) => u.status !== "PAID").length;

  return NextResponse.json({
    customer,
    summary: {
      totalCreditGiven,
      totalPaid,
      outstanding,
      salesTotal,
      salesCount: sales.length,
      udharCount: udhars.length,
      pendingUdharCount,
    },
    transactions: withBalance,
  });
}
