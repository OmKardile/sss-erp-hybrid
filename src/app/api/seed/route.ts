import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Seeds the database with realistic demo data if empty.
export async function POST() {
  const counts = await Promise.all([
    db.product.count(),
    db.purchase.count(),
    db.income.count(),
    db.expense.count(),
    db.udhar.count(),
  ]);
  const isEmpty = counts.every((c) => c === 0);
  if (!isEmpty) {
    return NextResponse.json({ seeded: false, message: "Database already has data." });
  }

  const now = new Date();

  // --- Products ---
  const productSeed = [
    { name: "Aashirvaad Atta 5kg", brand: "Aashirvaad", category: "Groceries", purchasePrice: 240, sellingPrice: 285, quantity: 28, unitType: "box", minStockAlert: 6 },
    { name: "Tata Salt 1kg", brand: "Tata", category: "Groceries", purchasePrice: 24, sellingPrice: 30, quantity: 4, unitType: "pcs", minStockAlert: 8 },
    { name: "Fortune Sunflower Oil 1L", brand: "Fortune", category: "Groceries", purchasePrice: 130, sellingPrice: 155, quantity: 18, unitType: "litre", minStockAlert: 5 },
    { name: "Amul Gold Milk 500ml", brand: "Amul", category: "Dairy", purchasePrice: 28, sellingPrice: 33, quantity: 40, unitType: "pcs", minStockAlert: 12 },
    { name: "Britannia Marie Gold", brand: "Britannia", category: "Snacks", purchasePrice: 32, sellingPrice: 40, quantity: 22, unitType: "pcs", minStockAlert: 6 },
    { name: "Lays Magic Masala", brand: "Lays", category: "Snacks", purchasePrice: 18, sellingPrice: 25, quantity: 3, unitType: "pcs", minStockAlert: 10 },
    { name: "Dabur Honey 250g", brand: "Dabur", category: "Groceries", purchasePrice: 115, sellingPrice: 145, quantity: 9, unitType: "pcs", minStockAlert: 4 },
    { name: "Surf Excel 1kg", brand: "Surf Excel", category: "Household", purchasePrice: 145, sellingPrice: 180, quantity: 15, unitType: "pcs", minStockAlert: 5 },
    { name: "Colgate Toothpaste 200g", brand: "Colgate", category: "Personal Care", purchasePrice: 78, sellingPrice: 105, quantity: 16, unitType: "pcs", minStockAlert: 6 },
    { name: "Parle-G Biscuit", brand: "Parle", category: "Snacks", purchasePrice: 5, sellingPrice: 10, quantity: 60, unitType: "pcs", minStockAlert: 20 },
    { name: "Maggi Noodles 70g", brand: "Maggi", category: "Snacks", purchasePrice: 12, sellingPrice: 14, quantity: 2, unitType: "pcs", minStockAlert: 24 },
    { name: "Basmati Rice 5kg", brand: "India Gate", category: "Groceries", purchasePrice: 420, sellingPrice: 495, quantity: 11, unitType: "box", minStockAlert: 4 },
  ];
  const products = [];
  for (const p of productSeed) {
    products.push(
      await db.product.create({
        data: { ...p, sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}` },
      })
    );
  }

  // --- Helpers ---
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  // --- Income (last 45 days) ---
  const incomeSources = [
    ["Counter Sales", "Sales"],
    ["Home Delivery", "Sales"],
    ["Wholesale Order", "Sales"],
    ["Festival Stall", "Sales"],
    ["Kirana Refill", "Sales"],
  ];
  for (let i = 0; i < 60; i++) {
    const day = daysAgo(Math.floor(Math.random() * 45));
    const [source, category] = incomeSources[Math.floor(Math.random() * incomeSources.length)];
    await db.income.create({
      data: {
        source,
        category,
        amount: Math.floor(Math.random() * 4000) + 800,
        date: day,
        notes: Math.random() > 0.7 ? "UPI payment" : null,
      },
    });
  }

  // --- Expenses (last 45 days) ---
  const expenseCats = ["Rent", "Electricity", "Salaries", "Transport", "Packaging", "Maintenance", "Misc"];
  for (let i = 0; i < 35; i++) {
    const cat = expenseCats[Math.floor(Math.random() * expenseCats.length)];
    await db.expense.create({
      data: {
        category: cat,
        amount: Math.floor(Math.random() * 2500) + 200,
        date: daysAgo(Math.floor(Math.random() * 45)),
        notes: Math.random() > 0.6 ? "Paid via bank transfer" : null,
      },
    });
  }

  // --- Purchases (last 45 days) ---
  const supplierNames = ["Mahalaxmi Distributors", "Shree Traders", "Anand Wholesale", "Patil Suppliers", "Verma Enterprises"];
  for (let i = 0; i < 28; i++) {
    const prod = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 20) + 5;
    const unit = prod.purchasePrice;
    await db.purchase.create({
      data: {
        supplierName: supplierNames[Math.floor(Math.random() * supplierNames.length)],
        productName: prod.name,
        quantity: qty,
        unitPrice: unit,
        totalAmount: qty * unit,
        purchaseDate: daysAgo(Math.floor(Math.random() * 45)),
        notes: "Restock",
      },
    });
  }

  // --- Udhar ---
  const customersList = ["Ramesh Patil", "Sunita Deshmukh", "Ajay Kale", "Priya Jadhav", "Vijay More", "Neha Shinde", "Sachin Pawar"];
  for (let i = 0; i < 8; i++) {
    const amount = Math.floor(Math.random() * 4000) + 500;
    const created = daysAgo(Math.floor(Math.random() * 30) + 5);
    const u = await db.udhar.create({
      data: {
        customerName: customersList[i % customersList.length],
        phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`,
        description: ["Monthly groceries", "Festival bulk order", "Kirana refill", "Party supplies"][i % 4],
        amount,
        date: created,
        dueDate: daysAgo(-15 + Math.floor(Math.random() * 5)),
        status: "PENDING",
        notes: null,
      },
    });
    // Add some partial payments
    if (i % 2 === 0) {
      await db.udharPayment.create({
        data: {
          udharId: u.id,
          amount: Math.floor(amount * 0.4),
          date: daysAgo(Math.floor(Math.random() * 5)),
          notes: "Part payment",
        },
      });
    }
  }

  // --- Customers ---
  for (const name of customersList) {
    await db.customer.create({
      data: { name, phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`, address: "Pune, MH" },
    });
  }

  // --- Suppliers ---
  for (const name of supplierNames) {
    await db.supplier.create({
      data: { name, phone: `9${Math.floor(100000000 + Math.random() * 899999999)}`, address: "Pune Market Yard" },
    });
  }

  return NextResponse.json({
    seeded: true,
    counts: {
      products: products.length,
      income: 60,
      expenses: 35,
      purchases: 28,
      udhar: 8,
      customers: customersList.length,
      suppliers: supplierNames.length,
    },
  });
}
