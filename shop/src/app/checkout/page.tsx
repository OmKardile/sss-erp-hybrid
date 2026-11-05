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
  ShoppingCart,
  Smartphone,
  TicketPercent,
} from "lucide-react";
import { Button } from "@/components/ui-button";
import { Toast } from "@/components/toast";
import { AnimatedIcon } from "@/components/animated-icon";
import { cn, formatCurrency } from "@/lib/utils";
import {
  STORE_CONFIG,
  resolveProductImage,
} from "@/lib/config";
import {
  availableCoupons,
  validateCoupon,
  computeTotals,
  type CouponDef,
  type CouponValidation,
} from "@/lib/coupons";
import { useI18n } from "@/components/locale-provider";
import { useMrName } from "@/lib/mr-names";
import { useActiveTheme } from "@/lib/use-active-theme";
import { DICT, festiveFor } from "@/lib/i18n";
import type { CartTotals, CartItemView, OrderView } from "@/lib/types";

export default function CheckoutPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const theme = useActiveTheme();
  const locTheme = theme ? festiveFor(theme, locale) : null;

  const [cart, setCart] = useState<CartTotals | null>(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // Coupon state — validated with the shared pure module; the API
  // re-validates authoritatively when the order is placed.
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponValidation | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);

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

  /** Localize a validation-reason string from the shared coupon module. */
  function localizeCouponReason(reason?: string | null): string {
    if (!reason) return t("c.invalid");
    if (reason === "Enter a coupon code") return t("c.enter-code");
    if (reason === "This coupon isn't active right now") return t("c.not-active");
    if (reason === "Coupon gives no discount on this cart")
      return t("c.no-discount");
    const m = reason.match(/^Add items worth ₹(\d+) more to use (\w+)$/);
    if (m) return t("c.add-more", { amount: `₹${m[1]}`, code: m[2] });
    return reason; // unknown future reason — pass through as-is
  }

  /** Localized description for a coupon pill (store dict or festive copy). */
  function couponDesc(c: CouponDef): string {
    if (locTheme && theme?.coupon && c.code === theme.coupon.code) {
      return locTheme.couponText || c.description;
    }
    return DICT[`c.desc-${c.code}`] ? t(`c.desc-${c.code}`) : c.description;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = t("v.name-required");
    if (!form.customerPhone.trim()) e.customerPhone = t("v.phone-required");
    else if (!/^\+?[0-9\s-]{8,15}$/.test(form.customerPhone.trim()))
      e.customerPhone = t("v.phone-invalid");
    if (!form.customerAddress.trim()) e.customerAddress = t("v.address-required");
    if (!form.pincode.trim()) e.pincode = t("v.pin-required");
    else if (!/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = t("v.pin-invalid");
    if (form.customerEmail && !/^\S+@\S+\.\S+$/.test(form.customerEmail))
      e.customerEmail = t("v.email-invalid");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function applyCoupon(code?: string) {
    const input = (code ?? couponInput).trim().toUpperCase();
    if (!input) return;
    const result = validateCoupon(input, subtotal);
    setCoupon(result.ok ? result : null);
    if (result.ok) {
      const save = `${t("checkout.applied-save")} ${formatCurrency(result.discount)}${
        result.freeDelivery ? ` ${t("checkout.applied-freedelivery")}` : ""
      }`;
      setCouponMsg(save);
    } else {
      setCouponMsg(localizeCouponReason(result.reason));
    }
    if (result.ok) setCouponInput(input);
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponMsg(null);
    setCouponInput("");
  }

  async function placeOrder() {
    if (!cart || cart.items.length === 0) {
      setToast({ open: true, msg: t("t.cart-empty") });
      return;
    }
    if (!validate()) {
      setToast({ open: true, msg: t("t.fill-required") });
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod,
          couponCode: coupon?.ok ? coupon.coupon?.code : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({
          open: true,
          msg: data?.error || t("t.place-failed"),
        });
        setPlacing(false);
        return;
      }
      const order: OrderView = data.order;
      window.dispatchEvent(new Event("sss:cart-changed"));
      router.push(`/order/${order.orderNumber}`);
    } catch {
      setToast({ open: true, msg: t("t.network") });
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
  const totals = computeTotals(subtotal, coupon);
  const total = totals.total;
  const deliveryFee = totals.deliveryFee;
  const coupons = availableCoupons();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-44 pt-6 sm:px-6 lg:px-8 lg:pb-16">
      <Toast
        open={toast.open}
        message={toast.msg}
        type="error"
        onClose={() => setToast({ open: false, msg: "" })}
      />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {t("checkout.title")}
        </h1>
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> {t("checkout.back")}
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-100 bg-emerald-50/40 px-6 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
            <AnimatedIcon
              name="cart"
              size={36}
              trigger="loop"
              speed={0.6}
              fallback={ShoppingCart}
              className="text-emerald-500"
            />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">
            {t("checkout.empty-title")}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t("checkout.empty-sub")}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-emerald-800 px-6 text-sm font-semibold text-white hover:bg-emerald-900"
          >
            {t("checkout.browse")}
          </Link>
        </div>
      ) : (
        <>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Coupon — festive + store offers */}
            <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-[0_4px_20px_rgba(28,25,23,0.05)] backdrop-blur-md">
              <div className="flex items-center gap-2 bg-emerald-800 px-5 py-3 text-white">
                <TicketPercent className="h-4 w-4" aria-hidden />
                <h2 className="text-sm font-bold">{t("checkout.coupons")}</h2>
              </div>
              <div className="p-5 sm:p-6">
                {coupon?.ok ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-900">
                        <AnimatedIcon name="check" size={14} trigger="once" />
                        {t("checkout.applied", { code: coupon.coupon?.code })}
                      </p>
                      <p className="text-xs text-emerald-700">{couponMsg}</p>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="inline-flex h-9 items-center rounded-lg border border-emerald-300 bg-white px-3 text-xs font-semibold text-emerald-800"
                    >
                      {t("checkout.remove")}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t("checkout.coupon-placeholder")}
                        aria-label={t("checkout.coupon-aria")}
                        className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold tracking-wide uppercase outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => applyCoupon()}
                        className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-800 px-5 text-sm font-bold text-white"
                      >
                        {t("checkout.apply")}
                      </button>
                    </div>
                    {couponMsg && (
                      <p className="mt-2 text-xs text-rose-600">{couponMsg}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {coupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => applyCoupon(c.code)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800"
                        >
                          <TicketPercent className="h-3 w-3" aria-hidden />
                          {c.code} — {couponDesc(c)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Delivery details */}
            <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-[0_4px_20px_rgba(28,25,23,0.05)] backdrop-blur-md">
              <div className="flex items-center gap-2 bg-emerald-800 px-5 py-3 text-white">
                <MapPin className="h-4 w-4" />
                <h2 className="text-sm font-bold">{t("checkout.delivery-details")}</h2>
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-4 text-xs text-slate-500">
                  {t("checkout.delivery-note")}
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={t("checkout.f-name")}
                    value={form.customerName}
                    onChange={(v) => setField("customerName", v)}
                    error={errors.customerName}
                    placeholder={t("checkout.p-name")}
                  />
                  <Field
                    label={t("checkout.f-phone")}
                    value={form.customerPhone}
                    onChange={(v) => setField("customerPhone", v)}
                    error={errors.customerPhone}
                    placeholder={t("checkout.p-phone")}
                    inputMode="tel"
                  />
                  <Field
                    label={t("checkout.f-email")}
                    value={form.customerEmail}
                    onChange={(v) => setField("customerEmail", v)}
                    error={errors.customerEmail}
                    placeholder="you@email.com"
                    inputMode="email"
                    className="sm:col-span-2"
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label={t("checkout.f-address")}
                      value={form.customerAddress}
                      onChange={(v) => setField("customerAddress", v)}
                      error={errors.customerAddress}
                      placeholder={t("checkout.p-address")}
                      textarea
                    />
                  </div>
                  <Field
                    label={t("checkout.f-city")}
                    value={form.city}
                    onChange={(v) => setField("city", v)}
                    placeholder={t("checkout.p-city")}
                  />
                  <Field
                    label={t("checkout.f-pincode")}
                    value={form.pincode}
                    onChange={(v) => setField("pincode", v)}
                    error={errors.pincode}
                    placeholder="411001"
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label={t("checkout.f-notes")}
                      value={form.notes}
                      onChange={(v) => setField("notes", v)}
                      placeholder={t("checkout.p-notes")}
                      textarea
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-[0_4px_20px_rgba(28,25,23,0.05)] backdrop-blur-md">
              <div className="flex items-center gap-2 bg-emerald-800 px-5 py-3 text-white">
                <Banknote className="h-4 w-4" />
                <h2 className="text-sm font-bold">{t("checkout.payment-method")}</h2>
              </div>
              <div className="p-5 sm:p-6">
                <p className="mb-4 text-xs text-slate-500">
                  {t("checkout.payment-note")}
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
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
                          : "bg-stone-100 text-stone-600",
                      )}
                    >
                      <Banknote className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {t("checkout.cod")}</p>
                      <p className="text-xs text-slate-500">
                        {t("checkout.cod-sub")}
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
                      "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition",
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
                          : "bg-stone-100 text-stone-600",
                      )}
                    >
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {t("checkout.upi")}</p>
                      <p className="text-xs text-slate-500">
                        {t("checkout.upi-sub")}
                      </p>
                    </div>
                    {paymentMethod === "UPI" && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    )}
                  </button>
                </div>

                {paymentMethod === "UPI" && (
                  <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-white/60 bg-white/50 p-5 backdrop-blur-md sm:flex-row">
                    <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white">
                      <QrCode className="h-16 w-16 text-slate-700" />
                      <p className="mt-1 text-[10px] text-slate-400">
                        {t("checkout.scan")}
                      </p>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-xs text-slate-500">{t("checkout.pay-to")}</p>
                      <p className="font-mono text-lg font-bold text-slate-900">
                        {STORE_CONFIG.upiId}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {t("checkout.amount")}{" "}
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(total)}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {t("checkout.upi-note")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/65 shadow-[0_4px_20px_rgba(28,25,23,0.05)] backdrop-blur-md">
              <div className="flex items-center gap-2 bg-emerald-800 px-5 py-3 text-white">
                <Truck className="h-4 w-4" />
                <h2 className="text-sm font-bold">{t("checkout.summary")}</h2>
              </div>
              <div className="p-5">
                <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 scroll-soft">
                  {items.map((ci) => (
                    <SummaryItem key={ci.id} ci={ci} />
                  ))}
                </ul>

                <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-600">{t("cart.subtotal")}</dt>
                    <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-slate-600">
                        {t("checkout.coupon-line", { code: coupon?.coupon?.code })}
                      </dt>
                      <dd className="font-semibold text-emerald-700">
                        −{formatCurrency(totals.discount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-600">{t("cart.delivery-fee")}</dt>
                    <dd className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600">{t("cart.free")}</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-slate-900">
                    {t("cart.total")}
                  </span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(total)}
                  </span>
                </div>

                <Button
                  onClick={placeOrder}
                  disabled={placing}
                  size="lg"
                  className="mt-4 hidden w-full bg-emerald-800 hover:bg-emerald-900 lg:inline-flex"
                >
                  {placing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {t("checkout.placing")}
                    </>
                  ) : (
                    <>{t("checkout.place-order")}</>
                  )}
                </Button>

                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  {t("checkout.secure")}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Sticky mobile place-order bar — sits above the bottom nav
            (same pattern as the cart page) */}
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-30 border-t border-white/60 bg-white/70 px-4 py-3 shadow-[0_-8px_32px_rgba(28,25,23,0.16)] backdrop-blur-2xl lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-stone-500">{t("cart.total")}</p>
              <p className="font-display text-lg font-semibold text-stone-900">
                {formatCurrency(total)}
              </p>
            </div>
            <Button
              onClick={placeOrder}
              disabled={placing}
              size="lg"
              className="h-12 flex-1 bg-emerald-800 hover:bg-emerald-900"
            >
              {placing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("checkout.placing")}
                </>
              ) : (
                <>{t("checkout.place-order")}</>
              )}
            </Button>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

/** One summary row — its own component so the product name can resolve
 *  its Marathi form via useMrName (hooks can't live in maps). */
function SummaryItem({ ci }: { ci: CartItemView }) {
  const name = useMrName(ci.product.name);
  const thumb = resolveProductImage(ci.product.image, ci.product.category);
  return (
    <li className="flex items-start justify-between gap-2 text-sm">
      <div className="flex min-w-0 items-start gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
          <img src={thumb} alt={name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-900">{name}</p>
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
