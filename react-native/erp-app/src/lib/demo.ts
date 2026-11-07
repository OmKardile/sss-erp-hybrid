/**
 * Bundled demo dataset for the ERP app — a realistic single-shop month so
 * every module (dashboard, POS, udhar, reports) is fully explorable before
 * the owner wires the live ERP API (Settings → ERP API URL).
 */

import type {
  Customer,
  DashboardResponse,
  Expense,
  Income,
  Product,
  Sale,
  Udhar,
  UdharPayment,
} from "./types";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 30, 0, 0);
  return d.toISOString();
}

export const DEMO_PRODUCTS: Product[] = [
  { id: "p1", name: "Aashirvaad Atta — Whole Wheat", brand: "Aashirvaad", category: "Groceries", sku: "ATA-5K", purchasePrice: 218, sellingPrice: 245, quantity: 40, unitType: "5 kg", minStockAlert: 8 },
  { id: "p2", name: "Amul Taaza Toned Milk", brand: "Amul", category: "Dairy", sku: "MLK-500", purchasePrice: 24, sellingPrice: 27, quantity: 60, unitType: "500 ml", minStockAlert: 20 },
  { id: "p3", name: "Tata Salt — Iodised", brand: "Tata", category: "Groceries", sku: "SLT-1K", purchasePrice: 24, sellingPrice: 28, quantity: 6, unitType: "1 kg", minStockAlert: 10 },
  { id: "p4", name: "Maggi 2-Minute Masala Noodles", brand: "Maggi", category: "Snacks", sku: "MGG-70", purchasePrice: 12, sellingPrice: 14, quantity: 200, unitType: "70 g", minStockAlert: 40 },
  { id: "p5", name: "Fortune Sunflower Refined Oil", brand: "Fortune", category: "Groceries", sku: "OIL-1L", purchasePrice: 132, sellingPrice: 145, quantity: 30, unitType: "1 L", minStockAlert: 6 },
  { id: "p6", name: "Britannia Marie Gold Biscuits", brand: "Britannia", category: "Snacks", sku: "BIS-200", purchasePrice: 31, sellingPrice: 35, quantity: 80, unitType: "200 g", minStockAlert: 15 },
  { id: "p7", name: "Coca-Cola — PET Bottle", brand: "Coca-Cola", category: "Beverages", sku: "COK-750", purchasePrice: 35, sellingPrice: 40, quantity: 4, unitType: "750 ml", minStockAlert: 12 },
  { id: "p8", name: "Surf Excel Easy Wash", brand: "Surf Excel", category: "Household", sku: "SRF-1K", purchasePrice: 101, sellingPrice: 115, quantity: 25, unitType: "1 kg", minStockAlert: 5 },
  { id: "p9", name: "Banana — Robusta", category: "Fruits & Vegetables", sku: "BAN-DOZ", purchasePrice: 42, sellingPrice: 48, quantity: 35, unitType: "1 dozen", minStockAlert: 10 },
  { id: "p10", name: "Onion — Loose", category: "Fruits & Vegetables", sku: "ONI-1K", purchasePrice: 28, sellingPrice: 35, quantity: 60, unitType: "1 kg", minStockAlert: 20 },
  { id: "p11", name: "Colgate Strong Teeth", brand: "Colgate", category: "Personal Care", sku: "CLG-200", purchasePrice: 84, sellingPrice: 95, quantity: 45, unitType: "200 g", minStockAlert: 10 },
  { id: "p12", name: "Mother Dairy Curd", brand: "Mother Dairy", category: "Dairy", sku: "CRD-400", purchasePrice: 30, sellingPrice: 35, quantity: 3, unitType: "400 g", minStockAlert: 12 },
];

export const DEMO_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Rajesh Patil", phone: "+91 98220 11223", address: "Kothrud, Pune" },
  { id: "c2", name: "Sunita Deshmukh", phone: "+91 99700 44556", address: "Warje, Pune" },
  { id: "c3", name: "Imran Shaikh", phone: "+91 91580 77889", address: "Kondhwa, Pune" },
  { id: "c4", name: "Meera Joshi", phone: "+91 98900 33445", address: "Karve Nagar, Pune" },
  { id: "c5", name: "Amit Kulkarni", phone: "+91 90280 66778", address: "Bavdhan, Pune" },
];

export const DEMO_INCOME: Income[] = [];
export const DEMO_EXPENSES: Expense[] = [
  { id: "e1", category: "Rent", amount: 12000, date: daysAgo(25), notes: "Shop rent — this month" },
  { id: "e2", category: "Electricity", amount: 2350, date: daysAgo(18), notes: "MSEB bill" },
  { id: "e3", category: "Transport", amount: 1800, date: daysAgo(12), notes: "Mandi pickup + delivery fuel" },
  { id: "e4", category: "Packing", amount: 940, date: daysAgo(9), notes: "Carry bags and pouches" },
  { id: "e5", category: "Wages", amount: 8000, date: daysAgo(5), notes: "Helper salary" },
  { id: "e6", category: "Electricity", amount: 2210, date: daysAgo(2), notes: "MSEB bill — previous" },
];

export const DEMO_PURCHASE_TOTALS = [
  { id: "pu1", supplierName: "Pune Wholesale Distributors", totalAmount: 46500, date: daysAgo(24) },
  { id: "pu2", supplierName: "Amul Depot Baner", totalAmount: 12800, date: daysAgo(16) },
  { id: "pu3", supplierName: "Mandi Traders Gultekdi", totalAmount: 8200, date: daysAgo(8) },
  { id: "pu4", supplierName: "Pune Wholesale Distributors", totalAmount: 15800, date: daysAgo(3) },
];

const udharPayments: UdharPayment[] = [
  { id: "up1", udharId: "u1", amount: 500, date: daysAgo(9), notes: "Part payment — cash" },
  { id: "up2", udharId: "u1", amount: 700, date: daysAgo(3), notes: "Part payment — UPI" },
];

export const DEMO_UDHAR: Udhar[] = [
  {
    id: "u1",
    customerName: "Rajesh Patil",
    phone: "+91 98220 11223",
    description: "Monthly grocery — credit",
    amount: 2400,
    date: daysAgo(21),
    dueDate: daysAgo(-9),
    status: "PARTIAL",
    notes: "Regular customer",
    payments: udharPayments,
  },
  {
    id: "u2",
    customerName: "Sunita Deshmukh",
    phone: "+91 99700 44556",
    description: "Milk + bread — weekly tab",
    amount: 1180,
    date: daysAgo(12),
    dueDate: daysAgo(-2),
    status: "PENDING",
    payments: [],
  },
  {
    id: "u3",
    customerName: "Meera Joshi",
    phone: "+91 98900 33445",
    description: "Festival shopping — Diwali",
    amount: 3650,
    date: daysAgo(40),
    dueDate: daysAgo(20),
    status: "PAID",
    notes: "Settled in full",
    payments: [{ id: "up3", udharId: "u3", amount: 3650, date: daysAgo(22), notes: "Full settlement" }],
  },
];

/** Daily POS income for the last ~45 days (deterministic pseudo-random). */
function seedIncome(): void {
  let seed = 20261106;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };
  for (let d = 45; d >= 0; d--) {
    // ~80% of days have counter sales between ₹2.2k–₹9.5k
    if (rand() < 0.8) {
      const amount = Math.round(2200 + rand() * 7300);
      DEMO_INCOME.push({
        id: `inc-${d}`,
        source: d % 7 === 0 ? "Online Order SSS-2026" + String(1000 + d) : "Counter Sales",
        category: "Sales",
        amount,
        date: daysAgo(d),
        notes: d % 7 === 0 ? "E-commerce sale synced from the storefront" : "POS",
      });
    }
  }
}
seedIncome();

export interface DemoDb {
  products: Product[];
  income: Income[];
  expenses: Expense[];
  udhar: Udhar[];
  customers: Customer[];
  sales: Sale[];
  purchases: { id: string; supplierName: string; totalAmount: number; purchaseDate: string }[];
}

export function freshDemoDb(): DemoDb {
  return {
    products: DEMO_PRODUCTS.map((p) => ({ ...p })),
    income: DEMO_INCOME.map((i) => ({ ...i })),
    expenses: DEMO_EXPENSES.map((e) => ({ ...e })),
    udhar: DEMO_UDHAR.map((u) => ({ ...u, payments: u.payments.map((p) => ({ ...p })) })),
    customers: DEMO_CUSTOMERS.map((c) => ({ ...c })),
    sales: [],
    purchases: DEMO_PURCHASE_TOTALS.map((p) => ({ ...p, purchaseDate: p.date })),
  };
}

/** Same dashboard math as the ERP API (summary + charts). */
export function demoDashboard(db: DemoDb): DashboardResponse {
  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonth = todayStr.substring(0, 7);
  const sum = (arr: { amount: number }[]) => arr.reduce((s, x) => s + x.amount, 0);

  const todayIncome = sum(db.income.filter((i) => i.date.split("T")[0] === todayStr));
  const todayExpenses = sum(db.expenses.filter((e) => e.date.split("T")[0] === todayStr));
  const monthlyIncome = sum(db.income.filter((i) => i.date.startsWith(currentMonth)));
  const monthlyExpenses = sum(db.expenses.filter((e) => e.date.startsWith(currentMonth)));
  const monthlyPurchases = db.purchases
    .filter((p) => p.purchaseDate.startsWith(currentMonth))
    .reduce((s, p) => s + p.totalAmount, 0);

  const pendingUdhars = db.udhar.filter((u) => u.status !== "PAID");
  const pendingUdhar = pendingUdhars.reduce(
    (s, u) => s + Math.max(0, u.amount - u.payments.reduce((ps, p) => ps + p.amount, 0)),
    0,
  );

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const incomeMap = new Map<string, number>();
  db.income
    .filter((i) => new Date(i.date) >= thirtyDaysAgo)
    .forEach((i) => {
      const k = i.date.split("T")[0];
      incomeMap.set(k, (incomeMap.get(k) || 0) + i.amount);
    });

  const expenseDistMap = new Map<string, number>();
  db.expenses.forEach((e) =>
    expenseDistMap.set(e.category, (expenseDistMap.get(e.category) || 0) + e.amount),
  );

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyMap = new Map<string, { income: number; expenses: number; purchases: number }>();
  const ensure = (m: string) => {
    if (!monthlyMap.has(m)) monthlyMap.set(m, { income: 0, expenses: 0, purchases: 0 });
    return monthlyMap.get(m)!;
  };
  db.income.forEach((i) => (ensure(i.date.substring(0, 7)).income += i.amount));
  db.expenses.forEach((e) => (ensure(e.date.substring(0, 7)).expenses += e.amount));
  db.purchases.forEach((p) => (ensure(p.purchaseDate.substring(0, 7)).purchases += p.totalAmount));

  return {
    summary: {
      todayIncome,
      todayExpenses,
      monthlyIncome,
      monthlyExpenses,
      monthlyPurchases,
      monthlyProfit: monthlyIncome - monthlyExpenses - monthlyPurchases,
      inventoryValue: db.products.reduce((s, p) => s + p.purchasePrice * p.quantity, 0),
      inventoryCount: db.products.reduce((s, p) => s + p.quantity, 0),
      lowStockCount: db.products.filter((p) => p.quantity <= p.minStockAlert).length,
      pendingUdhar,
      pendingUdharCount: pendingUdhars.length,
      totalProducts: db.products.length,
    },
    charts: {
      last30DaysIncome: Array.from(incomeMap.entries())
        .map(([date, total]) => ({ date, total }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      expenseDistribution: Array.from(expenseDistMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      monthlyComparison: Array.from(monthlyMap.entries())
        .map(([month, v]) => ({ month, ...v, profit: v.income - v.expenses - v.purchases }))
        .sort((a, b) => a.month.localeCompare(b.month)),
      topProducts: db.products
        .map((p) => ({ name: p.name, stock: p.quantity, value: p.purchasePrice * p.quantity }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    },
  };
}
