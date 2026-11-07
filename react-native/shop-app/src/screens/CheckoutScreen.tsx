/** Checkout — delivery details form, COD/UPI payment, coupon carry-over, place order. */

import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart, buildLocalOrder } from "../state/cart";
import { Btn, T, font } from "../components/ui";
import { rupees } from "../lib/format";
import { computeTotals, validateCoupon, type CouponValidation } from "../lib/coupons";
import { newCartSessionId } from "../lib/api";
import type { OrderView } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CartStackParams } from "../nav";
import { BackRow } from "./ProductScreen";

type Props = NativeStackScreenProps<CartStackParams, "Checkout">;

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  pincode: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "Pune",
  pincode: "",
  notes: "",
};

export function CheckoutScreen({ navigation }: Props) {
  const { t, api, name, isMr } = useApp();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [payment, setPayment] = useState<"COD" | "UPI">("COD");
  const { coupon, setCoupon } = cart;
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const totals = useMemo(() => computeTotals(cart.subtotal, coupon), [cart.subtotal, coupon]);

  const set = (k: keyof FormState) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const applyCoupon = () => {
    const result = validateCoupon(code, cart.subtotal);
    if (result.ok) {
      setCoupon(result);
      setCouponError(null);
    } else {
      setCoupon(null);
      setCouponError(result.reason ?? t("c.invalid"));
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = t("v.name-required");
    if (!form.phone.trim()) e.phone = t("v.phone-required");
    else if (!/^\+?[0-9\s-]{8,15}$/.test(form.phone.trim())) e.phone = t("v.phone-invalid");
    if (!form.address.trim()) e.address = t("v.address-required");
    if (form.pincode && !/^[0-9]{6}$/.test(form.pincode.trim())) e.pincode = t("v.pin-invalid");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = t("v.email-invalid");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = async () => {
    if (cart.lines.length === 0) {
      setGlobalError(t("t.cart-empty"));
      return;
    }
    if (!validate()) {
      setGlobalError(t("t.fill-required"));
      return;
    }
    setPlacing(true);
    setGlobalError(null);
    try {
      if (api.isLive) {
        const order = await api.checkout(
          cart.lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            price: l.price,
            quantity: l.quantity,
          })),
          {
            customerName: form.name.trim(),
            customerPhone: form.phone.trim(),
            customerAddress: form.address.trim(),
            city: form.city.trim() || undefined,
            pincode: form.pincode.trim() || undefined,
            customerEmail: form.email.trim() || undefined,
            notes: form.notes.trim() || undefined,
            paymentMethod: payment,
            couponCode: coupon?.ok ? coupon.coupon?.code : undefined,
          },
          newCartSessionId(),
        );
        if (payment === "UPI") {
          openUpi(order.total);
        }
        cart.clear();
        navigation.replace("OrderConfirm", { order });
      } else {
        // demo mode — local order
        const local = buildLocalOrder(cart.lines, totals, payment);
        if (payment === "UPI") openUpi(local.total);
        cart.saveLocalOrder(local);
        const order: OrderView = {
          id: `local_${local.orderNumber}`,
          orderNumber: local.orderNumber,
          customerName: form.name.trim(),
          customerPhone: form.phone.trim(),
          customerEmail: form.email.trim() || null,
          customerAddress: form.address.trim(),
          city: form.city.trim() || null,
          pincode: form.pincode.trim() || null,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          couponCode: coupon?.ok ? coupon.coupon?.code ?? null : null,
          discountTotal: totals.discount,
          paymentMethod: payment,
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
          notes: form.notes.trim() || null,
          createdAt: local.createdAt,
          items: local.items.map((it, i) => ({ id: `i${i}`, ...it })),
          source: "local",
        };
        cart.clear();
        navigation.replace("OrderConfirm", { order });
      }
    } catch (err) {
      setGlobalError(err instanceof Error ? err.message : t("t.place-failed"));
    } finally {
      setPlacing(false);
    }
  };

  const openUpi = (amount: number) => {
    const upiId = "shubhamsupershopee@upi";
    const url = `upi://pay?pa=${upiId}&pn=${encodeURIComponent("Shubham Super Shopee")}&am=${amount.toFixed(2)}&cu=INR`;
    Linking.canOpenURL(url)
      .then((ok) => {
        if (ok) Linking.openURL(url);
      })
      .catch(() => {});
  };

  if (cart.lines.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackRow title={t("checkout.title")} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SP.xl, gap: 14 }}>
          <T family="display" size={18} align="center">
            {t("checkout.empty-title")}
          </T>
          <T size={13} color={C.sage} align="center">
            {t("checkout.empty-sub")}
          </T>
          <Btn title={t("checkout.browse")} onPress={() => (navigation as any).navigate("ShopTab")} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <BackRow title={t("checkout.title")} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 260 }} showsVerticalScrollIndicator={false}>
          {/* coupon */}
          <View style={{ paddingHorizontal: SP.lg, gap: 8, marginBottom: SP.lg }}>
            <T family="bodyBold" size={14}>
              {t("checkout.coupons")}
            </T>
            {coupon?.ok && coupon.coupon ? (
              <View style={styles.couponOk}>
                <View style={{ flex: 1 }}>
                  <T family="bodyBold" size={13} color={C.pine}>
                    {t("checkout.applied", { code: coupon.coupon.code })}
                  </T>
                  <T family="body" size={12} color={C.pine}>
                    {coupon.coupon.description}
                  </T>
                </View>
                <Pressable onPress={() => { setCoupon(null); setCode(""); }}>
                  <T family="bodyBold" size={12} color={C.heat}>
                    {t("checkout.remove")}
                  </T>
                </Pressable>
              </View>
            ) : (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={styles.inputWrap}>
                  <TextInput
                    accessibilityLabel={t("checkout.coupon-aria")}
                    placeholder={t("checkout.coupon-placeholder")}
                    placeholderTextColor={C.sage}
                    value={code}
                    onChangeText={(v) => { setCode(v); setCouponError(null); }}
                    autoCapitalize="characters"
                    style={[styles.input, { fontFamily: font("body", isMr) }]}
                  />
                </View>
                <Btn title={t("checkout.apply")} size="md" onPress={applyCoupon} style={{ height: 48 }} />
              </View>
            )}
            {couponError ? (
              <T family="body" size={12} color={C.heat}>
                {couponError}
              </T>
            ) : null}
          </View>

          {/* delivery details */}
          <View style={{ paddingHorizontal: SP.lg, gap: 10 }}>
            <T family="bodyBold" size={14}>
              {t("checkout.delivery-details")}
            </T>
            <T family="body" size={12} color={C.sage}>
              {t("checkout.delivery-note")}
            </T>
            <Field label={t("checkout.f-name")} value={form.name} onChange={set("name")} error={errors.name} placeholder={t("checkout.p-name")} />
            <Field label={t("checkout.f-phone")} value={form.phone} onChange={set("phone")} error={errors.phone} placeholder={t("checkout.p-phone")} keyboardType="phone-pad" />
            <Field label={t("checkout.f-email")} value={form.email} onChange={set("email")} error={errors.email} placeholder="you@example.com" keyboardType="email-address" />
            <Field label={t("checkout.f-address")} value={form.address} onChange={set("address")} error={errors.address} placeholder={t("checkout.p-address")} multiline />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Field label={t("checkout.f-city")} value={form.city} onChange={set("city")} placeholder="Pune" />
              </View>
              <View style={{ flex: 1 }}>
                <Field label={t("checkout.f-pincode")} value={form.pincode} onChange={set("pincode")} error={errors.pincode} placeholder="411001" keyboardType="number-pad" />
              </View>
            </View>
            <Field label={t("checkout.f-notes")} value={form.notes} onChange={set("notes")} placeholder={t("checkout.p-notes")} multiline />
          </View>

          {/* payment */}
          <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl, gap: 10 }}>
            <T family="bodyBold" size={14}>
              {t("checkout.payment-method")}
            </T>
            <PaymentOption
              active={payment === "COD"}
              onPress={() => setPayment("COD")}
              title={t("checkout.cod")}
              sub={t("checkout.cod-sub")}
              badge="💵"
            />
            <PaymentOption
              active={payment === "UPI"}
              onPress={() => setPayment("UPI")}
              title={t("checkout.upi")}
              sub={t("checkout.upi-sub")}
              badge="📱"
            />
          </View>

          {/* summary */}
          <View style={styles.summaryCard}>
            <T family="bodyBold" size={15} style={{ marginBottom: 8 }}>
              {t("checkout.summary")}
            </T>
            <SumRow label={t("cart.subtotal")} value={rupees(totals.subtotal)} />
            {totals.discount > 0 ? (
              <SumRow label={t("order.coupon-line", { code: coupon?.coupon?.code ?? "" })} value={`− ${rupees(totals.discount)}`} valueColor={C.heat} />
            ) : null}
            <SumRow label={t("cart.delivery-fee")} value={totals.deliveryFee === 0 ? t("cart.free") : rupees(totals.deliveryFee)} />
            <View style={{ height: 2, backgroundColor: C.cream, borderRadius: 2, marginVertical: 8 }} />
            <SumRow label={t("cart.total")} value={rupees(totals.total)} bold light />
          </View>

          {globalError ? (
            <T family="body" size={13} color={C.heat} align="center" style={{ marginTop: 12, paddingHorizontal: SP.lg }}>
              {globalError}
            </T>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.ctaBar}>
        <View style={{ flex: 1 }}>
          <T family="body" size={11} color={C.sage}>
            {t("cart.total")}
          </T>
          <T family="display" size={17}>
            {rupees(totals.total)}
          </T>
        </View>
        <Btn title={placing ? t("checkout.placing") : t("checkout.place-order")} variant="heat" style={{ flex: 1.4 }} loading={placing} onPress={placeOrder} />
      </View>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address" | "number-pad";
}) {
  const { isMr } = useApp();
  return (
    <View style={{ gap: 4 }}>
      <T family="bodyMedium" size={12} color={C.ink}>
        {label}
      </T>
      <View style={[styles.inputWrap, error && { borderColor: C.heat }]}>
        <TextInput
          accessibilityLabel={label}
          placeholder={placeholder}
          placeholderTextColor={C.sage}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
          keyboardType={keyboardType}
          style={[styles.input, multiline && { height: 76, textAlignVertical: "top" }, { fontFamily: font("body", isMr) }]}
        />
      </View>
      {error ? (
        <T family="body" size={11} color={C.heat}>
          {error}
        </T>
      ) : null}
    </View>
  );
}

function PaymentOption({
  active,
  onPress,
  title,
  sub,
  badge,
}: {
  active: boolean;
  onPress: () => void;
  title: string;
  sub: string;
  badge: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.payOption,
        { borderColor: active ? C.ink : C.line, backgroundColor: active ? C.pop : C.white },
      ]}
    >
      <T size={20}>{badge}</T>
      <View style={{ flex: 1 }}>
        <T family="bodyBold" size={14}>
          {title}
        </T>
        <T family="body" size={12} color={C.sage}>
          {sub}
        </T>
      </View>
      <View style={[styles.radio, { borderColor: active ? C.ink : C.line }]}>
        {active ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function SumRow({
  label,
  value,
  bold,
  light,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  light?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <T family={bold ? "bodyBold" : "body"} size={bold ? 15 : 13} color={light ? "#cfe3d6" : C.sage}>
        {label}
      </T>
      <T family={bold ? "bodyBold" : "bodyMedium"} size={bold ? 15 : 13} color={valueColor ?? (light ? C.cream : C.ink)}>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  couponOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.pop,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.md,
    padding: 12,
  },
  inputWrap: {
    height: 48,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 14, color: C.ink, padding: 0 },
  payOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 2,
    borderRadius: R.card,
    padding: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.ink },
  summaryCard: {
    marginHorizontal: SP.lg,
    marginTop: SP.xl,
    backgroundColor: C.pine,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.lg,
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.cream,
    borderTopWidth: 2,
    borderTopColor: C.ink,
    paddingHorizontal: SP.lg,
    paddingTop: 12,
    paddingBottom: 18,
  },
});
