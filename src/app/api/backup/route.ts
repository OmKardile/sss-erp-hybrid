import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET = full DB export as JSON
export async function GET() {
  const [products, purchases, income, expenses, udhars, payments, customers, suppliers, sales, saleItems, targets, adjustments] =
    await Promise.all([
      db.product.findMany(),
      db.purchase.findMany(),
      db.income.findMany(),
      db.expense.findMany(),
      db.udhar.findMany({ include: { payments: true } }),
      db.udharPayment.findMany(),
      db.customer.findMany(),
      db.supplier.findMany(),
      db.sale.findMany({ include: { items: true } }),
      db.saleItem.findMany(),
      db.target.findMany(),
      db.adjustment.findMany(),
    ]);

  const backup = {
    version: 4,
    exportedAt: new Date().toISOString(),
    store: "Shubham Super Shopee",
    data: {
      products,
      purchases,
      income,
      expenses,
      udhars,
      payments,
      customers,
      suppliers,
      sales,
      saleItems,
      targets,
      adjustments,
    },
  };
  return NextResponse.json(backup);
}

// POST = restore from backup JSON (replaces all data)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body?.data;
    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid backup format" }, { status: 400 });
    }

    await db.$transaction(async (tx) => {
      // Wipe (order matters for FK)
      await tx.adjustment.deleteMany();
      await tx.target.deleteMany();
      await tx.saleItem.deleteMany();
      await tx.sale.deleteMany();
      await tx.udharPayment.deleteMany();
      await tx.udhar.deleteMany();
      await tx.purchase.deleteMany();
      await tx.income.deleteMany();
      await tx.expense.deleteMany();
      await tx.product.deleteMany();
      await tx.customer.deleteMany();
      await tx.supplier.deleteMany();

      const toDate = (v: any) => (v ? new Date(v) : null);

      if (Array.isArray(data.products)) {
        for (const p of data.products) {
          await tx.product.create({
            data: {
              id: String(p.id),
              name: String(p.name),
              brand: p.brand ?? null,
              category: p.category ?? null,
              sku: p.sku ?? null,
              purchasePrice: Number(p.purchasePrice) || 0,
              sellingPrice: Number(p.sellingPrice) || 0,
              quantity: Number(p.quantity) || 0,
              unitType: String(p.unitType ?? "pcs"),
              minStockAlert: Number(p.minStockAlert) || 0,
              expiryDate: toDate(p.expiryDate),
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
              updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.purchases)) {
        for (const p of data.purchases) {
          await tx.purchase.create({
            data: {
              id: String(p.id),
              supplierName: String(p.supplierName),
              productName: String(p.productName),
              quantity: Number(p.quantity) || 0,
              unitPrice: Number(p.unitPrice) || 0,
              totalAmount: Number(p.totalAmount) || 0,
              purchaseDate: toDate(p.purchaseDate) ?? new Date(),
              notes: p.notes ?? null,
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.income)) {
        for (const i of data.income) {
          await tx.income.create({
            data: {
              id: String(i.id),
              source: String(i.source),
              category: String(i.category ?? "Sales"),
              amount: Number(i.amount) || 0,
              date: toDate(i.date) ?? new Date(),
              notes: i.notes ?? null,
              createdAt: i.createdAt ? new Date(i.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.expenses)) {
        for (const e of data.expenses) {
          await tx.expense.create({
            data: {
              id: String(e.id),
              category: String(e.category),
              amount: Number(e.amount) || 0,
              date: toDate(e.date) ?? new Date(),
              notes: e.notes ?? null,
              createdAt: e.createdAt ? new Date(e.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.udhars)) {
        for (const u of data.udhars) {
          await tx.udhar.create({
            data: {
              id: String(u.id),
              customerName: String(u.customerName),
              phone: u.phone ?? null,
              description: String(u.description ?? ""),
              amount: Number(u.amount) || 0,
              date: toDate(u.date) ?? new Date(),
              dueDate: toDate(u.dueDate),
              status: String(u.status ?? "PENDING"),
              notes: u.notes ?? null,
              createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
              updatedAt: u.updatedAt ? new Date(u.updatedAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.payments)) {
        for (const p of data.payments) {
          await tx.udharPayment.create({
            data: {
              id: String(p.id),
              udharId: String(p.udharId),
              amount: Number(p.amount) || 0,
              date: toDate(p.date) ?? new Date(),
              notes: p.notes ?? null,
              createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.customers)) {
        for (const c of data.customers) {
          await tx.customer.create({
            data: {
              id: String(c.id),
              name: String(c.name),
              phone: c.phone ?? null,
              address: c.address ?? null,
              createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.suppliers)) {
        for (const s of data.suppliers) {
          await tx.supplier.create({
            data: {
              id: String(s.id),
              name: String(s.name),
              phone: s.phone ?? null,
              address: s.address ?? null,
              createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.sales)) {
        for (const s of data.sales) {
          await tx.sale.create({
            data: {
              id: String(s.id),
              customerName: s.customerName ?? null,
              paymentMethod: String(s.paymentMethod ?? "Cash"),
              subtotal: Number(s.subtotal) || 0,
              discount: Number(s.discount) || 0,
              total: Number(s.total) || 0,
              itemCount: Number(s.itemCount) || 0,
              notes: s.notes ?? null,
              date: toDate(s.date) ?? new Date(),
              incomeId: s.incomeId ?? null,
              createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.saleItems)) {
        for (const it of data.saleItems) {
          await tx.saleItem.create({
            data: {
              id: String(it.id),
              saleId: String(it.saleId),
              productId: it.productId ?? null,
              name: String(it.name),
              price: Number(it.price) || 0,
              quantity: Number(it.quantity) || 0,
              lineTotal: Number(it.lineTotal) || 0,
              createdAt: it.createdAt ? new Date(it.createdAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.targets)) {
        for (const t of data.targets) {
          await tx.target.create({
            data: {
              id: String(t.id),
              month: String(t.month),
              amount: Number(t.amount) || 0,
              createdAt: t.createdAt ? new Date(t.createdAt) : new Date(),
              updatedAt: t.updatedAt ? new Date(t.updatedAt) : new Date(),
            },
          });
        }
      }
      if (Array.isArray(data.adjustments)) {
        for (const a of data.adjustments) {
          await tx.adjustment.create({
            data: {
              id: String(a.id),
              productId: String(a.productId),
              productName: String(a.productName),
              oldQty: Number(a.oldQty) || 0,
              newQty: Number(a.newQty) || 0,
              diff: Number(a.diff) || 0,
              reason: String(a.reason ?? "Stock-take"),
              notes: a.notes ?? null,
              date: toDate(a.date) ?? new Date(),
              createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
            },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Backup restored successfully" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Restore failed" },
      { status: 400 }
    );
  }
}

// DELETE = wipe all data
export async function DELETE() {
  await db.$transaction(async (tx) => {
    await tx.adjustment.deleteMany();
    await tx.target.deleteMany();
    await tx.saleItem.deleteMany();
    await tx.sale.deleteMany();
    await tx.udharPayment.deleteMany();
    await tx.udhar.deleteMany();
    await tx.purchase.deleteMany();
    await tx.income.deleteMany();
    await tx.expense.deleteMany();
    await tx.product.deleteMany();
    await tx.customer.deleteMany();
    await tx.supplier.deleteMany();
  });
  return NextResponse.json({ success: true, message: "All data cleared" });
}
