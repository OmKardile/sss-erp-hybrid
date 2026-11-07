/** Cart — line items with steppers, coupon entry, totals, proceed CTA. */

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart } from "../state/cart";
import { Btn, EmptyState, T, font } from "../components/ui";
import { productImageSource } from "../components/ProductCard";
import { Image } from "react-native";
import { rupees } from "../lib/format";
import { computeTotals, validateCoupon, type CouponValidation } from "../lib/coupons";
import type { CartStackParams } from "../nav";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FREE_DELIVERY_THRESHOLD } from "../lib/coupons";

type Props = NativeStackScreenProps<CartStackParams, "Cart">;

export function CartScreen({ navigation }: Props) {
  const { t, name, isMr } = useApp();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const { coupon, setCoupon } = cart;

  const totals = useMemo(
    () => computeTotals(cart.subtotal, coupon),
    [cart.subtotal, coupon],
  );

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

  if (cart.lines.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <T family="display" size={22} style={{ paddingHorizontal: SP.lg, paddingTop: SP.lg }}>
          {t("cart.title")}
        </T>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: SP.xl }}>
          <EmptyState emoji="🧺" title={t("cart.empty-title")} sub={t("cart.empty-sub")} />
          <Btn title={t("cart.start")} onPress={() => (navigation as any).navigate("ShopTab")} style={{ alignSelf: "stretch", marginTop: 8 }} />
        </View>
      </SafeAreaView>
    );
  }

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);
  const progress = Math.min(100, Math.round((totals.subtotal / FREE_DELIVERY_THRESHOLD) * 100));

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <T family="display" size={22} style={{ paddingHorizontal: SP.lg, paddingTop: SP.lg, paddingBottom: SP.md }}>
        {t("cart.title")}
      </T>
      <ScrollView contentContainerStyle={{ paddingBottom: 300 }} showsVerticalScrollIndicator={false}>
        {/* free delivery progress */}
        <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.lg }}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <T family="body" size={12} color={C.sage} style={{ marginTop: 6 }}>
            {remaining > 0
              ? t("cart.unlock-more", { amount: rupees(remaining) })
              : t("cart.unlocked")}
          </T>
        </View>

        {/* lines */}
        {cart.lines.map((line) => {
          const img = productImageSource(line.image, line.slug, "");
          return (
            <View key={line.productId} style={styles.lineCard}>
              {img ? <Image source={img} style={styles.linePhoto} resizeMode="cover" /> : <View style={[styles.linePhoto, { backgroundColor: C.pop }]} />}
              <View style={{ flex: 1, gap: 2 }}>
                <T family="bodyBold" size={14} numberOfLines={2}>
                  {name(line.name)}
                </T>
                <T family="body" size={12} color={C.sage}>
                  {name(line.unitType)} · {rupees(line.price)}
                </T>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <T family="bodyBold" size={15}>
                    {rupees(line.price * line.quantity)}
                  </T>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <Pressable
                      accessibilityLabel={t("cart.remove-aria", { name: name(line.name) })}
                      onPress={() => cart.remove(line.productId)}
                      hitSlop={8}
                      style={styles.miniBtn}
                    >
                      <T size={13} color={C.heat} family="bodyBold">
                        ✕
                      </T>
                    </Pressable>
                    <View style={styles.stepperRow}>
                      <Pressable
                        accessibilityLabel={t("stepper.decrease")}
                        onPress={() => cart.setQty(line.productId, line.quantity - 1)}
                        style={styles.stepBtn}
                        hitSlop={8}
                      >
                        <T family="bodyBold" size={15} color={C.pop}>
                          −
                        </T>
                      </Pressable>
                      <T family="bodyBold" size={14} style={{ minWidth: 24, textAlign: "center" }}>
                        {line.quantity}
                      </T>
                      <Pressable
                        accessibilityLabel={t("stepper.increase")}
                        onPress={() => cart.setQty(line.productId, line.quantity + 1)}
                        style={styles.stepBtn}
                        hitSlop={8}
                      >
                        <T family="bodyBold" size={15} color={C.pop}>
                          +
                        </T>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* coupon */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.md, gap: 8 }}>
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
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCoupon(null);
                  setCode("");
                }}
              >
                <T family="bodyBold" size={12} color={C.heat}>
                  {t("checkout.remove")}
                </T>
              </Pressable>
            </View>
          ) : (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={styles.couponInputWrap}>
                <TextInput
                  accessibilityLabel={t("checkout.coupon-aria")}
                  placeholder={t("checkout.coupon-placeholder")}
                  placeholderTextColor={C.sage}
                  value={code}
                  onChangeText={(v) => {
                    setCode(v);
                    setCouponError(null);
                  }}
                  autoCapitalize="characters"
                  style={[styles.couponInput, { fontFamily: font("body", isMr) }]}
                />
              </View>
              <Btn title={t("checkout.apply")} size="md" onPress={applyCoupon} style={{ height: 46 }} />
            </View>
          )}
          {couponError ? (
            <T family="body" size={12} color={C.heat}>
              {couponError}
            </T>
          ) : null}
        </View>

        {/* summary */}
        <View style={styles.summaryCard}>
          <T family="bodyBold" size={15} style={{ marginBottom: 8 }}>
            {t("cart.summary")}
          </T>
          <Row label={t("cart.subtotal")} value={rupees(totals.subtotal)} />
          {totals.discount > 0 ? (
            <Row label={t("order.coupon-line", { code: coupon?.coupon?.code ?? "" })} value={`− ${rupees(totals.discount)}`} valueColor={C.heat} />
          ) : null}
          <Row
            label={t("cart.delivery-fee")}
            value={totals.deliveryFee === 0 ? t("cart.free") : rupees(totals.deliveryFee)}
          />
          <View style={{ height: 2, backgroundColor: C.ink, borderRadius: 2, marginVertical: 8 }} />
          <Row label={t("cart.total")} value={rupees(totals.total)} bold />
          <T family="body" size={11} color={C.sage} style={{ marginTop: 6 }}>
            {t("pd.tax-note")}
          </T>
        </View>
      </ScrollView>

      <View style={styles.ctaBar}>
        <View>
          <T family="body" size={11} color={C.sage}>
            {t("cart.total")}
          </T>
          <T family="display" size={18}>
            {rupees(totals.total)}
          </T>
        </View>
        <Btn title={t("cart.proceed")} variant="heat" style={{ flex: 1 }} onPress={() => navigation.navigate("Checkout")} />
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  bold,
  valueColor,
}: {
  label: string;
  value: string;
  bold?: boolean;
  valueColor?: string;
}) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <T family={bold ? "bodyBold" : "body"} size={bold ? 15 : 13} color={bold ? C.ink : C.sage}>
        {label}
      </T>
      <T family={bold ? "bodyBold" : "bodyMedium"} size={bold ? 15 : 13} color={valueColor ?? C.ink}>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  progressTrack: {
    height: 12,
    borderRadius: R.pill,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: C.pop },
  lineCard: {
    flexDirection: "row",
    gap: 12,
    marginHorizontal: SP.lg,
    marginBottom: SP.md,
    padding: 12,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.card,
  },
  linePhoto: { width: 64, height: 64, borderRadius: R.sm },
  miniBtn: {
    width: 30,
    height: 30,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.heat,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: { width: 26, height: 26, alignItems: "center", justifyContent: "center" },
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
  couponInputWrap: {
    flex: 1,
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  couponInput: { fontSize: 14, color: C.ink, padding: 0 },
  summaryCard: {
    marginHorizontal: SP.lg,
    marginTop: SP.lg,
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
