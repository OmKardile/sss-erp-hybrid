"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Trash2,
  ChevronLeft,
  Loader2,
  ArrowRight,
  Truck,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { QuantityStepper } from "@/components/quantity-stepper";
import { cn, formatCurrency } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD, resolveProductImage } from "@/lib/config";
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
      <div className="flex h-64 items-center justify-center text-stone-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" aria-hidden />
      </div>
    );
  }

  const items = data?.items ?? [];
  const empty = items.length === 0;
  const subtotal = data?.subtotal ?? 0;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progressPct = Math.min(
    100,
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-44 pt-6 sm:px-6 lg:px-8 lg:pb-16">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display flex items-center gap-2.5 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Your Cart
          {items.length > 0 && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              {data?.itemCount ?? 0}
            </span>
          )}
        </h1>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-1 text-sm font-medium text-emerald-700"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden /> Continue shopping
        </Link>
      </div>

      {empty ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <ShoppingCart className="h-8 w-8 text-stone-400" aria-hidden />
          </div>
          <h2 className="font-display mt-4 text-lg font-semibold text-stone-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Browse our fresh products and add items to your cart.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white"
          >
            Start Shopping <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <>
          {/* Free delivery progress */}
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
            {remaining > 0 ? (
              <p className="text-sm font-medium text-emerald-900">
                Add{" "}
                <span className="font-semibold">
                  {formatCurrency(remaining)}
                </span>{" "}
                more to unlock{" "}
                <span className="font-semibold">free delivery</span>
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
                <Truck className="h-4 w-4" aria-hidden /> You&apos;ve unlocked
                free delivery
              </p>
            )}
            <div
              className="mt-2.5 h-2 overflow-hidden rounded-full bg-emerald-100"
              role="progressbar"
              aria-valuenow={Math.round(progressPct)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Free delivery progress"
            >
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Items */}
            <div className="lg:col-span-2">
              <ul className="space-y-3">
                {items.map((ci) => {
                  const thumb = resolveProductImage(
                    ci.product.image,
                    ci.product.category,
                  );
                  return (
                    <li
                      key={ci.id}
                      className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center sm:p-4"
                    >
                      <Link
                        href={`/product/${ci.product.slug}`}
                        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-100 bg-stone-50"
                      >
                        <img
                          src={thumb}
                          alt={ci.product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="flex-1">
                        <Link
                          href={`/product/${ci.product.slug}`}
                          className="text-sm font-semibold text-stone-900"
                        >
                          {ci.product.name}
                        </Link>
                        <p className="text-xs text-stone-500">
                          {ci.product.brand ? `${ci.product.brand} · ` : ""}
                          {ci.product.unitType}
                        </p>
                        <p className="mt-1 text-sm font-bold text-stone-900">
                          {formatCurrency(ci.product.price)}
                          {ci.product.compareAtPrice &&
                            ci.product.compareAtPrice > ci.product.price && (
                              <span className="ml-2 text-xs text-stone-400 line-through">
                                {formatCurrency(ci.product.compareAtPrice)}
                              </span>
                            )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <QuantityStepper
                          value={ci.quantity}
                          min={1}
                          max={99}
                          size="sm"
                          onChange={(v) => updateQty(ci.id, v)}
                        />
                        <div className="flex items-center gap-3">
                          <p className="font-display text-sm font-semibold text-stone-900">
                            {formatCurrency(ci.product.price * ci.quantity)}
                          </p>
                          <button
                            onClick={() => remove(ci.id)}
                            disabled={busy === ci.id}
                            aria-label={`Remove ${ci.product.name} from cart`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            {busy === ci.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : (
                              <Trash2 className="h-4 w-4" aria-hidden />
                            )}
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link
                href="/"
                className="mt-4 inline-flex h-11 items-center gap-1 text-sm font-medium text-emerald-700"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden /> Continue
                shopping
              </Link>
            </div>

            {/* Summary — desktop card CTA; on mobile the sticky bar is the CTA */}
            <aside className="lg:sticky lg:top-20 lg:self-start">
              <div className="rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-stone-900">
                  <ShoppingBag className="h-4 w-4 text-emerald-700" aria-hidden />{" "}
                  Order Summary
                </h2>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-stone-600">Subtotal</dt>
                    <dd className="font-semibold">
                      {formatCurrency(data?.subtotal ?? 0)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-stone-600">Delivery fee</dt>
                    <dd className="font-semibold">
                      {data?.deliveryFee === 0 ? (
                        <span className="text-emerald-700">FREE</span>
                      ) : (
                        formatCurrency(data?.deliveryFee ?? 0)
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                  <span className="text-sm font-semibold text-stone-900">
                    Total
                  </span>
                  <span className="font-display text-xl font-semibold text-stone-900">
                    {formatCurrency(data?.total ?? 0)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className={cn(
                    "mt-4 hidden h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white",
                    "lg:inline-flex hover:bg-emerald-900",
                  )}
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>

                <p className="mt-3 text-center text-[11px] text-stone-500">
                  Pay by COD or UPI · Free delivery above ₹
                  {FREE_DELIVERY_THRESHOLD}
                </p>
              </div>
            </aside>
          </div>

          {/* Sticky mobile checkout bar — sits above the bottom nav */}
          <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-stone-500">Total</p>
                <p className="font-display text-lg font-semibold text-stone-900">
                  {formatCurrency(data?.total ?? 0)}
                </p>
              </div>
              <Link
                href="/checkout"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-sm font-bold text-white"
              >
                Checkout <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
