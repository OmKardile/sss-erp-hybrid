/** ERP domain types — ported from the web ERP (src/lib/types.ts). */

export interface Product {
  id: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  sku?: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unitType: string;
  minStockAlert: number;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purchaseDate: string;
  notes?: string | null;
}

export interface Income {
  id: string;
  source: string;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface UdharPayment {
  id: string;
  udharId: string;
  amount: number;
  date: string;
  notes?: string | null;
}

export interface Udhar {
  id: string;
  customerName: string;
  phone?: string | null;
  description: string;
  amount: number;
  date: string;
  dueDate?: string | null;
  status: "PENDING" | "PARTIAL" | "PAID";
  notes?: string | null;
  payments: UdharPayment[];
  /** Client-computed outstanding (amount − payments). */
  outstanding?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface SaleItem {
  id?: string;
  productId?: string | null;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  customerName?: string | null;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  notes?: string | null;
  date: string;
  items: SaleItem[];
}

export interface DashboardSummary {
  todayIncome: number;
  todayExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyPurchases: number;
  monthlyProfit: number;
  inventoryValue: number;
  inventoryCount: number;
  lowStockCount: number;
  pendingUdhar: number;
  pendingUdharCount: number;
  totalProducts: number;
}

export interface DashboardCharts {
  last30DaysIncome: { date: string; total: number }[];
  expenseDistribution: { name: string; value: number }[];
  monthlyComparison: { month: string; income: number; expenses: number; purchases: number; profit: number }[];
  topProducts: { name: string; stock: number; value: number }[];
}

export interface DashboardResponse {
  summary: DashboardSummary;
  charts: DashboardCharts;
}
