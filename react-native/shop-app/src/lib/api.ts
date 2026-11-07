/**
 * Shop API client.
 *
 * Two modes:
 *  - LIVE  — a deployed storefront base URL (Settings → "Live store API"),
 *            e.g. https://shubham-super-shopee.vercel.app. Talks to the
 *            same /api endpoints the website uses. The cart session cookie
 *            (`cart_session`) is generated client-side and sent explicitly
 *            so the server-side cart/checkout flow works from the app.
 *  - DEMO  — no base URL (default): the bundled 16-product catalog and
 *            local order creation. Fully offline-capable.
 */

import { DEMO_CATEGORIES, DEMO_PRODUCTS, demoDetailFor } from "./demo";
import type { OrderView, ProductDetail, ProductListItem, ProductsResponse } from "./types";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  city?: string;
  pincode?: string;
  customerEmail?: string;
  notes?: string;
  paymentMethod: "COD" | "UPI";
  couponCode?: string;
}

function randomToken(len: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function generateOrderNumber(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `SSS-${y}${m}${d}-${rand}`;
}

export class ShopApi {
  constructor(private baseUrl: string) {}

  get isLive(): boolean {
    return /^https?:\/\//.test(this.baseUrl.trim());
  }

  private url(path: string): string {
    return `${this.baseUrl.replace(/\/+$/, "")}${path}`;
  }

  async products(opts?: { category?: string; q?: string }): Promise<ProductsResponse> {
    if (!this.isLive) {
      let items = DEMO_PRODUCTS;
      if (opts?.category && opts.category !== "All") {
        items = items.filter((p) => p.category === opts.category);
      }
      if (opts?.q) {
        const q = opts.q.toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.brand ?? "").toLowerCase().includes(q) ||
            (p.category ?? "").toLowerCase().includes(q),
        );
      }
      return { items, count: items.length, categories: DEMO_CATEGORIES };
    }
    const params = new URLSearchParams();
    if (opts?.category && opts.category !== "All") params.set("category", opts.category);
    if (opts?.q) params.set("q", opts.q);
    const qs = params.toString();
    const res = await fetch(this.url(`/api/products${qs ? `?${qs}` : ""}`), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`products ${res.status}`);
    return (await res.json()) as ProductsResponse;
  }

  async productDetail(slug: string): Promise<ProductDetail> {
    if (!this.isLive) {
      const d = demoDetailFor(slug);
      if (!d) throw new Error("not found");
      return d;
    }
    const res = await fetch(this.url(`/api/products/${encodeURIComponent(slug)}`), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`product ${res.status}`);
    return (await res.json()) as ProductDetail;
  }

  /** Push local cart lines to the server cart session, then checkout. */
  async checkout(
    lines: CartLine[],
    payload: CheckoutPayload,
    sessionId: string,
  ): Promise<OrderView> {
    if (!this.isLive) {
      throw new Error("checkout requires a live API base URL");
    }
    const cookie = `cart_session=${sessionId}`;
    // seed the server cart with our local lines
    for (const line of lines) {
      const res = await fetch(this.url("/api/cart"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: cookie },
        body: JSON.stringify({ productId: line.productId, quantity: line.quantity }),
      });
      if (!res.ok) throw new Error(`cart ${res.status}`);
    }
    const res = await fetch(this.url("/api/checkout"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as any).error || `checkout ${res.status}`);
    return data as OrderView;
  }

  async order(orderNumber: string): Promise<OrderView> {
    if (!this.isLive) throw new Error("not found");
    const res = await fetch(
      this.url(`/api/orders/${encodeURIComponent(orderNumber.trim())}`),
      { headers: { Accept: "application/json" } },
    );
    if (!res.ok) throw new Error(res.status === 404 ? "not found" : `order ${res.status}`);
    return (await res.json()) as OrderView;
  }

  /** Health probe used by Settings to validate a base URL. */
  async health(): Promise<{ ok: boolean; products?: number }> {
    if (!this.isLive) return { ok: true, products: DEMO_PRODUCTS.length };
    const res = await fetch(this.url("/api/health"), { headers: { Accept: "application/json" } });
    if (!res.ok) return { ok: false };
    const data = await res.json().catch(() => ({ ok: false }));
    return { ok: !!data.ok, products: data?.db?.products };
  }
}

/** Fresh cart session id, minted per order flow (mirrors web cookie format). */
export function newCartSessionId(): string {
  return `cart_${Date.now().toString(36)}${randomToken(14)}`;
}
