import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — global search across products, customers, suppliers, income, expenses, purchases, udhar.
// ?q=<query> returns grouped results with type + module link.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], total: 0 });
  }

  type Result = {
    id: string;
    type: "product" | "customer" | "supplier" | "income" | "expense" | "purchase" | "udhar";
    title: string;
    subtitle: string;
    module: string;
    amount?: number;
  };

  const results: Result[] = [];

  // Products
  const products = await db.product.findMany();
  products.forEach((p) => {
    if (
      p.name.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.sku || "").toLowerCase().includes(q)
    ) {
      results.push({
        id: p.id,
        type: "product",
        title: p.name,
        subtitle: `${p.brand || "—"} · ${p.quantity} ${p.unitType} · ₹${p.sellingPrice}`,
        module: "products",
      });
    }
  });

  // Customers
  const customers = await db.customer.findMany();
  customers.forEach((c) => {
    if (c.name.toLowerCase().includes(q) || (c.phone || "").includes(q) || (c.address || "").toLowerCase().includes(q)) {
      results.push({
        id: c.id,
        type: "customer",
        title: c.name,
        subtitle: c.phone || (c.address || "Customer"),
        module: "customers",
      });
    }
  });

  // Suppliers
  const suppliers = await db.supplier.findMany();
  suppliers.forEach((s) => {
    if (s.name.toLowerCase().includes(q) || (s.phone || "").includes(q) || (s.address || "").toLowerCase().includes(q)) {
      results.push({
        id: s.id,
        type: "supplier",
        title: s.name,
        subtitle: s.phone || (s.address || "Supplier"),
        module: "suppliers",
      });
    }
  });

  // Income
  const income = await db.income.findMany();
  income.forEach((i) => {
    if (i.source.toLowerCase().includes(q) || (i.notes || "").toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) {
      results.push({
        id: i.id,
        type: "income",
        title: i.source,
        subtitle: `${i.category} · ₹${i.amount}`,
        module: "income",
        amount: i.amount,
      });
    }
  });

  // Expenses
  const expenses = await db.expense.findMany();
  expenses.forEach((e) => {
    if (e.category.toLowerCase().includes(q) || (e.notes || "").toLowerCase().includes(q)) {
      results.push({
        id: e.id,
        type: "expense",
        title: e.category,
        subtitle: `₹${e.amount} · Expense`,
        module: "expenses",
        amount: e.amount,
      });
    }
  });

  // Purchases
  const purchases = await db.purchase.findMany();
  purchases.forEach((p) => {
    if (
      p.productName.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q) ||
      (p.notes || "").toLowerCase().includes(q)
    ) {
      results.push({
        id: p.id,
        type: "purchase",
        title: p.productName,
        subtitle: `${p.supplierName} · ₹${p.totalAmount}`,
        module: "purchases",
        amount: p.totalAmount,
      });
    }
  });

  // Udhar
  const udhars = await db.udhar.findMany();
  udhars.forEach((u) => {
    if (u.customerName.toLowerCase().includes(q) || u.description.toLowerCase().includes(q)) {
      results.push({
        id: u.id,
        type: "udhar",
        title: u.customerName,
        subtitle: `${u.description} · ₹${u.amount} · ${u.status}`,
        module: "udhar",
        amount: u.amount,
      });
    }
  });

  // Group counts
  const counts: Record<string, number> = {};
  results.forEach((r) => {
    counts[r.type] = (counts[r.type] || 0) + 1;
  });

  return NextResponse.json({
    results: results.slice(0, 30),
    total: results.length,
    counts,
  });
}
