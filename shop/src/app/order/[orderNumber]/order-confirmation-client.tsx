"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  MapPin,
  Phone,
  PhoneCall,
  Home,
  Package,
  Truck,
  Banknote,
  Smartphone,
  Copy,
  Check,
  Clock,
  ArrowRight,
  ShoppingCart,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui-button";
import { AnimatedIcon } from "@/components/animated-icon";
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
    <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* Success header */}
      <div className="relative flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <AnimatedIcon
            name="check-white"
            size={44}
            trigger="once"
            speed={0.8}
            fallback={CheckCircle2}
          />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Order Placed!
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Thank you, {order.customerName.split(" ")[0]}. We&apos;ve received your
          order and will call you shortly to confirm.
        </p>

        {/* Order number */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
          <span className="text-xs text-slate-500">Order number</span>
          <span className="font-mono text-sm font-bold text-slate-900">
            {order.orderNumber}
          </span>
          <button
            onClick={copyOrderNumber}
            className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
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

      {/* Estimated delivery — track your order */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 p-0.5 shadow-md">
        <div className="flex items-center gap-4 rounded-[15px] bg-white p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-100">
            <AnimatedIcon
              name="truck"
              size={30}
              trigger="loop"
              speed={0.5}
              fallback={Truck}
            />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-slate-900">
              Estimated delivery: {estimatedDeliveryDate(2)}
            </p>
            <p className="text-xs text-slate-600">
              Our team will call{" "}
              <span className="font-semibold">{order.customerPhone}</span> to
              confirm the delivery time.
            </p>
            {/* Mini tracker */}
            <div className="mt-3 flex items-center gap-1">
              <TrackerStep label="Placed" icon={<CheckCircle2 className="h-4 w-4" />} active />
              <div className="h-0.5 flex-1 bg-emerald-200" />
              <TrackerStep label="Confirmed" icon={<PhoneCall className="h-4 w-4" />} />
              <div className="h-0.5 flex-1 bg-slate-200" />
              <TrackerStep label="On the way" icon={<Truck className="h-4 w-4" />} />
              <div className="h-0.5 flex-1 bg-slate-200" />
              <TrackerStep label="Delivered" icon={<Home className="h-4 w-4" />} />
            </div>
          </div>
        </div>
      </div>

      {/* Order details */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Items */}
        <div className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-[0_6px_28px_rgba(28,25,23,0.07)] backdrop-blur-md sm:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Package className="h-4 w-4 text-emerald-600" /> Items in your
            order
          </h2>
          <ul className="mt-3 divide-y divide-slate-100">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-emerald-600">
                    <ShoppingCart className="h-5 w-5" />
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
              <dd className="font-semibold">{formatCurrency(order.subtotal)}</dd>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between">
                <dt className="text-slate-600">
                  Coupon {order.couponCode ? `(${order.couponCode})` : ""}
                </dt>
                <dd className="font-semibold text-emerald-600">
                  −{formatCurrency(order.discountTotal)}
                </dd>
              </div>
            )}
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
          {order.discountTotal > 0 && (
            <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-800">
              You saved {formatCurrency(order.discountTotal)} on this order
            </p>
          )}
        </div>

        {/* Delivery address */}
        <div className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-[0_6px_28px_rgba(28,25,23,0.07)] backdrop-blur-md">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <MapPin className="h-4 w-4 text-rose-500" /> Delivery address
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
        <div className="rounded-2xl border border-white/70 bg-white/65 p-5 shadow-[0_6px_28px_rgba(28,25,23,0.07)] backdrop-blur-md">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {order.paymentMethod === "UPI" ? (
              <Smartphone className="h-4 w-4 text-blue-500" />
            ) : (
              <Banknote className="h-4 w-4 text-emerald-500" />
            )}{" "}
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
        <div className="mt-4 rounded-2xl border border-white/70 bg-white/65 p-5 shadow-[0_6px_28px_rgba(28,25,23,0.07)] backdrop-blur-md">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <StickyNote className="h-4 w-4 text-emerald-600" aria-hidden /> Order
            notes
          </h2>
          <p className="mt-1 text-sm text-slate-600">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" /> Order placed on {order.createdAt}
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
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:shadow-lg"
            >
              Continue Shopping <ArrowRight className="h-4 w-4" />
            </Button>
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

function TrackerStep({
  label,
  icon,
  active,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={
          "flex h-7 w-7 items-center justify-center rounded-full shadow-sm " +
          (active
            ? "bg-emerald-500 text-white ring-2 ring-emerald-200"
            : "bg-slate-200 text-slate-500")
        }
      >
        {icon}
      </div>
      <span
        className={
          "text-[9px] font-semibold " +
          (active ? "text-emerald-700" : "text-slate-400")
        }
      >
        {label}
      </span>
    </div>
  );
}
