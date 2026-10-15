"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Package,
  Truck,
  Banknote,
  Smartphone,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui-button";
import { formatCurrency, estimatedDeliveryDate } from "@/lib/utils";
import { STORE_CONFIG } from "@/lib/config";
import type { OrderView } from "@/lib/types";

interface Props {
  order: OrderView;
}

export function OrderConfirmationClient({ order }: Props) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // scroll top on mount
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  function copyOrderNumber() {
    navigator.clipboard
      .writeText(order.orderNumber)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {});
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-emerald-100" />
          <span className="absolute inset-0 rounded-full bg-emerald-200/60 animate-ping" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white animate-pop-check">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
          Order placed successfully!
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Thank you, {order.customerName.split(" ")[0]}. We&apos;ve received
          your order and will call you shortly to confirm.
        </p>

        {/* Order number */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-xs text-slate-500">Order number</span>
          <span className="font-mono text-sm font-bold text-slate-900">
            {order.orderNumber}
          </span>
          <button
            onClick={copyOrderNumber}
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
            aria-label="Copy order number"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Estimated delivery */}
      <div className="mt-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Estimated delivery: {estimatedDeliveryDate(2)}
          </p>
          <p className="text-xs text-slate-600">
            Our team will call {order.customerPhone} to confirm the delivery
            time.
          </p>
        </div>
      </div>

      {/* Order details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Package className="h-4 w-4 text-emerald-600" />
            Items in your order
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <Package className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {it.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {it.quantity} × {formatCurrency(it.price)}
                    </p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(it.lineTotal)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-semibold">
                {formatCurrency(order.subtotal)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Delivery fee</dt>
              <dd className="font-semibold">
                {order.deliveryFee === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  formatCurrency(order.deliveryFee)
                )}
              </dd>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="text-lg font-bold text-slate-900">
                {formatCurrency(order.total)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Delivery address */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Delivery address
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {order.customerName}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {order.customerAddress}
          </p>
          <p className="text-sm text-slate-600">
            {[order.city, order.pincode].filter(Boolean).join(", ")}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="h-3.5 w-3.5" /> {order.customerPhone}
          </p>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {order.paymentMethod === "UPI" ? (
              <Smartphone className="h-4 w-4 text-emerald-600" />
            ) : (
              <Banknote className="h-4 w-4 text-emerald-600" />
            )}
            Payment
          </h2>
          <p className="mt-3 text-sm font-medium text-slate-900">
            {order.paymentMethod === "UPI"
              ? "UPI Payment"
              : "Cash on Delivery"}
          </p>
          {order.paymentMethod === "UPI" && (
            <p className="mt-1 text-xs text-slate-500">
              UPI ID:{" "}
              <span className="font-mono font-semibold text-slate-700">
                {STORE_CONFIG.upiId}
              </span>
            </p>
          )}
          <p className="mt-2 text-xs text-slate-500">
            Status:{" "}
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              {order.paymentStatus}
            </span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Order status:{" "}
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              {order.orderStatus}
            </span>
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Order notes
          </h2>
          <p className="mt-1 text-sm text-slate-600">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="text-xs text-slate-500">
          Order placed on {order.createdAt}
        </p>
        <p className="text-xs text-slate-500">
          Need help? Call us at{" "}
          <a
            href={`tel:${STORE_CONFIG.phone.replace(/\s+/g, "")}`}
            className="font-medium text-emerald-700 hover:underline"
          >
            {STORE_CONFIG.phone}
          </a>
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button size="lg">Continue Shopping</Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" size="lg">
              View Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
