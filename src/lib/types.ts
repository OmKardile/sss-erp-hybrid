// Shared TypeScript types for the ERP system

export type UnitType = "pcs" | "kg" | "box" | "litre" | "gm" | "dozen";

export type UdharStatus = "PENDING" | "PARTIAL" | "PAID";

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  sku: string | null;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  unitType: UnitType;
  minStockAlert: number;
  expiryDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  supplierName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  purchaseDate: string;
  notes: string | null;
  createdAt: string;
}

export interface Income {
  id: string;
  source: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface UdharPayment {
  id: string;
  udharId: string;
  amount: number;
  date: string;
  notes: string | null;
  createdAt: string;
}

export interface Udhar {
  id: string;
  customerName: string;
  phone: string | null;
  description: string;
  amount: number;
  date: string;
  dueDate: string | null;
  status: UdharStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  paidAmount?: number;
  remainingAmount?: number;
  payments?: UdharPayment[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
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
  monthlyComparison: {
    month: string;
    income: number;
    expenses: number;
    purchases: number;
    profit: number;
  }[];
  topProducts: { name: string; stock: number; value: number }[];
  cashFlow: { inflow: number; outflow: number; net: number };
}

export interface YearlyOverview {
  month: string;
  income: number;
  expenses: number;
  purchases: number;
  profit: number;
}
