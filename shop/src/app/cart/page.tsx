"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ShoppingCart,
  Trash2,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Package,
  Truck,
} from "lucide-react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { cn, formatCurrency } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/config";
import type { CartTotals } from "@/lib/types";

export default function CartPage() {
  const [data, setData] = useState<CartTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    window.addEventListener("sss:cart-changed", refresh);
    return () => window.removeEventListener("sss:cart-changed", refresh);
  }, []);

  async function updateQty(itemId: string, qty: number) {
    if (!data) return;
    setBusy(itemId);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: qty }),
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        window.dispatchEvent(new Event("sss:cart-changed"));
      }
    } finally {
      setBusy(null);
    }
  }

  async function remove(itemId: string) {
    if (!data) return;
    setBusy(itemId);
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const d = await res.json();
        setData(d);
        window.dispatchEvent(new Event("sss:cart-changed"));
      }
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-500" />
      </div>
    );
  }

  const items = data?.items ?? [];
  const empty = items.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <ShoppingCart className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Browse our fresh products and add items to your cart.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <ul className="space-y-3">
              {items.map((ci) => (
                <li
                  key={ci.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:p-4"
                >
                  <Link
                    href={`/product/${ci.product.slug}`}
                    className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50"
                  >
                    {ci.product.image ? (
                      <img
                        src={ci.product.image}
                        alt={ci.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-emerald-300" />
                    )}
                  </Link>

                  <div className="flex-1">
                    <Link
                      href={`/product/${ci.product.slug}`}
                      className="text-sm font-semibold text-slate-900 hover:text-emerald-700"
                    >
                      {ci.product.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {ci.product.brand ? `${ci.product.brand} • ` : ""}
                      {ci.product.unitType}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {formatCurrency(ci.product.price)}
                      {ci.product.compareAtPrice &&
                        ci.product.compareAtPrice > ci.product.price && (
                          <span className="ml-2 text-xs text-slate-400 line-through">
                            {formatCurrency(ci.product.compareAtPrice)}
                          </span>
                        )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-between">
                    <QuantityStepper
                      value={ci.quantity}
                      min={1}
                      max={99}
                      size="sm"
                      onChange={(v) => updateQty(ci.id, v)}
                    />
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(ci.product.price * ci.quantity)}
                      </p>
                      <button
                        onClick={() => remove(ci.id)}
                        disabled={busy === ci.id}
                        aria-label="Remove item"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        {busy === ci.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
            >
              <ChevronLeft className="h-4 w-4" /> Continue shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-base font-semibold text-slate-900">
                Order Summary
              </h2>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd className="font-semibold">
                    {formatCurrency(data?.subtotal ?? 0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-600">Delivery fee</dt>
                  <dd className="font-semibold">
                    {data?.deliveryFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatCurrency(data?.deliveryFee ?? 0)
                    )}
                  </dd>
                </div>
                {(data?.subtotal ?? 0) < FREE_DELIVERY_THRESHOLD && (
                  <p className="rounded-lg bg-emerald-50 p-2 text-[11px] text-emerald-700">
                    <Truck className="mr-1 inline h-3 w-3" />
                    Add{" "}
                    {formatCurrency(
                      FREE_DELIVERY_THRESHOLD - (data?.subtotal ?? 0),
                    )}{" "}
                    more for free delivery!
                  </p>
                )}
              </dl>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <span className="text-sm font-semibold text-slate-900">
                  Total
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {formatCurrency(data?.total ?? 0)}
                </span>
              </div>

              <Link
                href="/checkout"
                className={cn(
                  "mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition",
                  "hover:bg-emerald-700 active:scale-[0.98]",
                )}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-3 text-center text-[11px] text-slate-500">
                Pay by COD or UPI • Free delivery above ₹
                {FREE_DELIVERY_THRESHOLD}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
