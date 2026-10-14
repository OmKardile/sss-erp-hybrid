// Frontend API client for the ERP
import type {
  Product,
  Purchase,
  Income,
  Expense,
  Udhar,
  Customer,
  Supplier,
} from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Products
  products: {
    list: () => request<Product[]>("/api/products"),
    create: (data: Partial<Product>) =>
      request<Product>("/api/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Product>) =>
      request<Product>(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" }),
  },
  // Purchases
  purchases: {
    list: (supplier?: string) =>
      request<Purchase[]>(supplier ? `/api/purchases?supplier=${encodeURIComponent(supplier)}` : "/api/purchases"),
    create: (data: Partial<Purchase> & { autoStock?: boolean }) =>
      request<Purchase>("/api/purchases", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/purchases/${id}`, { method: "DELETE" }),
  },
  // Income
  income: {
    list: () => request<Income[]>("/api/income"),
    create: (data: Partial<Income>) =>
      request<Income>("/api/income", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/income/${id}`, { method: "DELETE" }),
  },
  // Expenses
  expenses: {
    list: () => request<Expense[]>("/api/expenses"),
    create: (data: Partial<Expense>) =>
      request<Expense>("/api/expenses", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/expenses/${id}`, { method: "DELETE" }),
  },
  // Udhar
  udhar: {
    list: (status?: string) =>
      request<Udhar[]>(status && status !== "ALL" ? `/api/udhar?status=${status}` : "/api/udhar"),
    create: (data: Partial<Udhar>) =>
      request<Udhar>("/api/udhar", { method: "POST", body: JSON.stringify(data) }),
    remove: (id: string) => request<{ success: boolean }>(`/api/udhar/${id}`, { method: "DELETE" }),
    settle: (id: string, status: "PAID" | "PENDING" | "PARTIAL") =>
      request<Udhar>(`/api/udhar/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    addPayment: (id: string, data: { amount: number; date: string; notes?: string }) =>
      request<{ payment: any; udhar: Udhar }>(`/api/udhar/${id}/payments`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    removePayment: (id: string, paymentId: string) =>
      request<{ success: boolean }>(`/api/udhar/${id}/payments?paymentId=${paymentId}`, {
        method: "DELETE",
      }),
  },
  // Customers
  customers: {
    list: () => request<Customer[]>("/api/customers"),
    create: (data: Partial<Customer>) =>
      request<Customer>("/api/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Customer>) =>
      request<Customer>(`/api/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/customers/${id}`, { method: "DELETE" }),
  },
  // Suppliers
  suppliers: {
    list: () => request<Supplier[]>("/api/suppliers"),
    create: (data: Partial<Supplier>) =>
      request<Supplier>("/api/suppliers", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Supplier>) =>
      request<Supplier>(`/api/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    remove: (id: string) =>
      request<{ success: boolean }>(`/api/suppliers/${id}`, { method: "DELETE" }),
  },
  // Aggregate
  dashboard: () =>
    request<{ summary: any; charts: any }>("/api/dashboard"),
  overview: () => request<any>("/api/overview"),
  reports: () => request<any>("/api/reports"),
  seed: () => request<{ seeded: boolean; counts?: any; message?: string }>("/api/seed", { method: "POST" }),
  // POS sale
  sale: (data: {
    items: { productId: string; name: string; price: number; quantity: number }[];
    customerName?: string;
    paymentMethod?: string;
    date?: string;
    discount?: number;
    notes?: string;
  }) =>
    request<{ success: boolean; receipt: any }>("/api/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  salesList: (limit?: number) =>
    request<any[]>(limit ? `/api/sales?limit=${limit}` : "/api/sales"),
  salesAnalytics: () => request<any>("/api/sales/analytics"),
  salesToday: () => request<any>("/api/sales/today"),
  // Backup / restore
  backup: {
    export: () => request<any>("/api/backup"),
    restore: (data: any) =>
      request<{ success: boolean; message: string }>("/api/backup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    clear: () =>
      request<{ success: boolean; message: string }>("/api/backup", { method: "DELETE" }),
  },
};
