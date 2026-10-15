"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Loader2,
  Banknote,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Truck,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui-button";
import { Toast } from "@/components/toast";
import { cn, formatCurrency } from "@/lib/utils";
import {
  DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
  STORE_CONFIG,
  getCategoryColor,
  getCategoryEmoji,
} from "@/lib/config";
import type { CartTotals, OrderView } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    city: "Pune",
    pincode: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (res.ok) {
          const d = await res.json();
          setCart(d);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function setField<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.customerPhone.trim()) e.customerPhone = "Phone is required";
    else if (!/^\+?[0-9\s-]{8,15}$/.test(form.customerPhone.trim()))
      e.customerPhone = "Enter a valid phone number";
    if (!form.customerAddress.trim()) e.customerAddress = "Address is required";
    if (!form.pincode.trim()) e.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = "Enter a valid 6-digit pincode";
    if (form.customerEmail && !/^\S+@\S+\.\S+$/.test(form.customerEmail))
      e.customerEmail = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!cart || cart.items.length === 0) {
      setToast({ open: true, msg: "Your cart is empty" });
      return;
    }
    if (!validate()) {
      setToast({ open: true, msg: "Please fill all required fields" });
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paymentMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({
          open: true,
          msg: data?.error || "Failed to place order",
        });
        setPlacing(false);
        return;
      }
      const order: OrderView = data.order;
      window.dispatchEvent(new Event("sss:cart-changed"));
      router.push(`/order/${order.orderNumber}`);
    } catch {
      setToast({ open: true, msg: "Network error — please try again" });
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Toast
        open={toast.open}
        message={toast.msg}
        type="error"
        onClose={() => setToast({ open: false, msg: "" })}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Checkout <span className="text-2xl">💳</span>
        </h1>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Back to cart
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/40 px-6 py-20 text-center">
          <span className="text-6xl drop-shadow-sm">🛒</span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Your cart is empty
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Add some products before checking out.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Delivery details */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white">
                <MapPin className="h-4 w-4" />
                <h2 className="text-sm font-bold">📍 Delivery Details</h2>
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-4 text-xs text-slate-500">
                  We&apos;ll deliver your order to this address.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Full name *"
                    value={form.customerName}
                    onChange={(v) => setField("customerName", v)}
                    error={errors.customerName}
                    placeholder="e.g. Rahul Sharma"
                  />
                  <Field
                    label="Phone number *"
                    value={form.customerPhone}
                    onChange={(v) => setField("customerPhone", v)}
                    error={errors.customerPhone}
                    placeholder="10-digit mobile"
                    inputMode="tel"
                  />
                  <Field
                    label="Email (optional)"
                    value={form.customerEmail}
                    onChange={(v) => setField("customerEmail", v)}
                    error={errors.customerEmail}
                    placeholder="you@email.com"
                    inputMode="email"
                    className="sm:col-span-2"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Full address *"
                      value={form.customerAddress}
                      onChange={(v) => setField("customerAddress", v)}
                      error={errors.customerAddress}
                      placeholder="House no, building, street, area, landmark"
                      textarea
                    />
                  </div>
                  <Field
                    label="City"
                    value={form.city}
                    onChange={(v) => setField("city", v)}
                    placeholder="Pune"
                  />
                  <Field
                    label="Pincode *"
                    value={form.pincode}
                    onChange={(v) => setField("pincode", v)}
                    error={errors.pincode}
                    placeholder="411001"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Order notes (optional)"
                      value={form.notes}
                      onChange={(v) => setField("notes", v)}
                      placeholder="e.g. Leave at the door, call before delivery"
                      textarea
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-white">
                <Banknote className="h-4 w-4" />
                <h2 className="text-sm font-bold">💳 Payment Method</h2>
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-4 text-xs text-slate-500">
                  Choose how you&apos;d like to pay.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition tap-scale",
                      paymentMethod === "COD"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                        paymentMethod === "COD"
                          ? "bg-emerald-600 text-white"
                          : "bg-amber-100 text-amber-700",
                      )}
                    >
                      💵
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-slate-500">
                        Pay in cash when your order arrives.
                      </p>
                    </div>
                    {paymentMethod === "COD" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("UPI")}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition tap-scale",
                      paymentMethod === "UPI"
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 hover:border-emerald-300",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                        paymentMethod === "UPI"
                          ? "bg-emerald-600 text-white"
                          : "bg-blue-100 text-blue-700",
                      )}
                    >
                      📱
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        UPI Payment
                      </p>
                      <p className="text-xs text-slate-500">
                        Pay now using any UPI app.
                      </p>
                    </div>
                    {paymentMethod === "UPI" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </button>
                </div>

                {paymentMethod === "UPI" && (
                  <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-5 sm:flex-row">
                    <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-white">
                      <QrCode className="h-16 w-16 text-slate-700" />
                      <p className="mt-1 text-[10px] text-slate-400">
                        Scan to pay
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-slate-500">Pay to UPI ID</p>
                      <p className="font-mono text-lg font-bold text-slate-900">
                        {STORE_CONFIG.upiId}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Amount to pay:{" "}
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        Use order note as reference. Your order will be confirmed
                        once payment is verified.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-white">
                <Truck className="h-4 w-4" />
                <h2 className="text-sm font-bold">🧾 Order Summary</h2>
              </div>
              <div className="p-5">
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 scroll-soft">
                  {items.map((ci) => {
                    const gradient = getCategoryColor(ci.product.category);
                    const emoji = getCategoryEmoji(ci.product.category);
                    return (
                      <li
                        key={ci.id}
                        className="flex items-start justify-between gap-2 text-sm"
                      >
                        <div className="flex min-w-0 items-start gap-2">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-base",
                              gradient,
                            )}
                          >
                            {ci.product.image ? (
                              <img
                                src={ci.product.image}
                                alt={ci.product.name}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <span>{emoji}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {ci.product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {ci.quantity} × {formatCurrency(ci.product.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(ci.product.price * ci.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Subtotal</dt>
                    <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-600">Delivery fee</dt>
                    <dd className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-slate-900">
                    Total
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={placing}
                  size="lg"
                  className="mt-4 w-full bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md hover:shadow-lg"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                    </>
                  ) : (
                    <>🎉 Place Order</>
                  )}
                </Button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  Secure checkout — your data is safe
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  inputMode,
  maxLength,
  textarea,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  textarea?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-slate-700">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className={cn(
            "mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition",
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              : "border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
          )}
        />
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "mt-1 h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none transition",
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              : "border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100",
          )}
        />
      )}
      {error && <p className="mt-1 text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}
