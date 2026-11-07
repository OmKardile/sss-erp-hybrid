/**
 * ERP API client — talks to the deployed web ERP (same /api routes the
 * web admin uses). Auth: the passkey is exchanged at /api/auth and every
 * subsequent request carries the `sss-erp-auth` cookie (base64 passkey),
 * mirroring the web app's httpOnly cookie.
 */

import type {
  Customer,
  DashboardResponse,
  Product,
  Udhar,
} from "./types";

export interface SalePayload {
  items: { productId: string; name: string; price: number; quantity: number }[];
  customerName?: string | null;
  paymentMethod: string;
  discount?: number;
  notes?: string | null;
}

export class ErpApi {
  constructor(
    public baseUrl: string,
    private passkey: string,
  ) {}

  get isLive(): boolean {
    return /^https?:\/\//.test(this.baseUrl.trim());
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, "")}${path}`;
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (this.passkey) {
      // cookie value = base64(passkey), same as the web login
      headers.Cookie = `sss-erp-auth=${btoa(this.passkey)}`;
    }
    return headers;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(this.url(path), {
      ...init,
      headers: { ...this.headers(), ...(init?.headers as Record<string, string>) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as any).error || `Request failed (${res.status})`);
    }
    return data as T;
  }

  /** Verify the passkey against the live ERP. */
  async login(passkey: string): Promise<boolean> {
    const res = await fetch(this.url("/api/auth"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passkey }),
    });
    if (res.ok) return true;
    const data = await res.json().catch(() => ({}));
    throw new Error((data as any).error || "Authentication failed");
  }

  health(): Promise<{ ok: boolean }> {
    return this.request<{ ok: boolean }>("/api/health");
  }

  dashboard(): Promise<DashboardResponse> {
    return this.request<DashboardResponse>("/api/dashboard");
  }

  products(): Promise<Product[]> {
    return this.request<Product[]>("/api/products");
  }

  createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  removeProduct(id: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/api/products/${id}`, { method: "DELETE" });
  }

  recordSale(payload: SalePayload): Promise<any> {
    return this.request<any>("/api/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  udhar(status?: string): Promise<Udhar[]> {
    return this.request<Udhar[]>(
      status && status !== "ALL" ? `/api/udhar?status=${status}` : "/api/udhar",
    );
  }

  createUdhar(data: Partial<Udhar>): Promise<Udhar> {
    return this.request<Udhar>("/api/udhar", { method: "POST", body: JSON.stringify(data) });
  }

  settleUdhar(id: string, status: "PAID" | "PENDING" | "PARTIAL"): Promise<Udhar> {
    return this.request<Udhar>(`/api/udhar/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  addUdharPayment(id: string, amount: number, notes?: string): Promise<any> {
    return this.request<any>(`/api/udhar/${id}/payments`, {
      method: "POST",
      body: JSON.stringify({ amount, date: new Date().toISOString(), notes }),
    });
  }

  customers(): Promise<Customer[]> {
    return this.request<Customer[]>("/api/customers");
  }

  createCustomer(data: Partial<Customer>): Promise<Customer> {
    return this.request<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  overview(): Promise<any> {
    return this.request<any>("/api/overview");
  }
}
