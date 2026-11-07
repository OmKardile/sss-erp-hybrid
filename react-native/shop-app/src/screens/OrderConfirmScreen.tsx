/** Order confirmation — number, tracker steps, items, totals, address. */

import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { Btn, T } from "../components/ui";
import { rupees } from "../lib/format";
import { formatDateFor } from "../lib/i18n";
import type { OrderView } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { CartStackParams } from "../nav";

type Props = NativeStackScreenProps<CartStackParams, "OrderConfirm">;

const STEPS = [
  { key: "order.step-placed", icon: "🧾" },
  { key: "order.step-confirmed", icon: "📞" },
  { key: "order.step-ontheway", icon: "🛵" },
  { key: "order.step-delivered", icon: "🎉" },
];

export function OrderConfirmScreen({ navigation, route }: Props) {
  const { order } = route.params;
  const { t, name, locale } = useApp();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* hero */}
        <View style={styles.hero}>
          <T size={48}>🎉</T>
          <T family="display" size={26} color={C.pop} align="center" style={{ marginTop: 8 }}>
            {t("order.placed")}
          </T>
          <T size={14} color="#cfe3d6" align="center" style={{ marginTop: 6 }}>
            {t("order.thanks", { name: order.customerName.split(" ")[0] })}
          </T>
          <View style={styles.numberChip}>
            <T family="bodyBold" size={16} color={C.cream}>
              {order.orderNumber}
            </T>
          </View>
        </View>

        {/* tracker */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl }}>
          {STEPS.map((s, i) => (
            <View key={s.key} style={styles.stepRow}>
              <View style={{ alignItems: "center" }}>
                <View style={[styles.stepDot, i === 0 && { backgroundColor: C.pop, borderColor: C.ink }]}>
                  <T size={15}>{s.icon}</T>
                </View>
                {i < STEPS.length - 1 ? <View style={styles.stepLine} /> : null}
              </View>
              <T family={i === 0 ? "bodyBold" : "body"} size={13} color={i === 0 ? C.ink : C.sage} style={{ paddingBottom: 18 }}>
                {t(s.key)}
              </T>
            </View>
          ))}
        </View>

        {/* items */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.md, gap: 8 }}>
          <T family="bodyBold" size={15}>
            {t("order.items")}
          </T>
          {order.items.map((it) => (
            <View key={it.id} style={styles.itemRow}>
              <T family="body" size={13} style={{ flex: 1 }} numberOfLines={2}>
                {name(it.name)} × {it.quantity}
              </T>
              <T family="bodyMedium" size={13}>
                {rupees(it.lineTotal)}
              </T>
            </View>
          ))}
          <View style={{ height: 2, backgroundColor: C.line, marginVertical: 4 }} />
          <View style={styles.itemRow}>
            <T family="body" size={13} color={C.sage}>
              {t("cart.subtotal")}
            </T>
            <T family="bodyMedium" size={13}>
              {rupees(order.subtotal)}
            </T>
          </View>
          {order.discountTotal > 0 ? (
            <View style={styles.itemRow}>
              <T family="body" size={13} color={C.sage}>
                {t("order.coupon-line", { code: order.couponCode ?? "" })}
              </T>
              <T family="bodyMedium" size={13} color={C.heat}>
                − {rupees(order.discountTotal)}
              </T>
            </View>
          ) : null}
          <View style={styles.itemRow}>
            <T family="body" size={13} color={C.sage}>
              {t("cart.delivery-fee")}
            </T>
            <T family="bodyMedium" size={13}>
              {order.deliveryFee === 0 ? t("cart.free") : rupees(order.deliveryFee)}
            </T>
          </View>
          <View style={styles.itemRow}>
            <T family="bodyBold" size={15}>
              {t("cart.total")}
            </T>
            <T family="bodyBold" size={15}>
              {rupees(order.total)}
            </T>
          </View>
        </View>

        {/* payment + address */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl, gap: 6 }}>
          <T family="bodyBold" size={14}>
            {t("order.payment")}
          </T>
          <T family="body" size={13} color={C.sage}>
            {order.paymentMethod} · {order.paymentStatus}
          </T>
          <T family="bodyBold" size={14} style={{ marginTop: 10 }}>
            {t("order.address")}
          </T>
          <T family="body" size={13} color={C.sage} style={{ lineHeight: 19 }}>
            {order.customerName} · {order.customerPhone}
            {"\n"}
            {order.customerAddress}
            {order.city ? `, ${order.city}` : ""}
            {order.pincode ? ` — ${order.pincode}` : ""}
          </T>
          <T family="body" size={12} color={C.sage} style={{ marginTop: 8 }}>
            {t("order.placed-on", { date: formatDateFor(locale, order.createdAt) })}
          </T>
        </View>

        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl, gap: 10 }}>
          <Btn title={t("order.continue")} onPress={() => (navigation as any).navigate("ShopTab")} />
          <Btn title={t("order.view-cart")} variant="ghost" onPress={() => (navigation as any).navigate("CartTab")} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  hero: {
    marginHorizontal: SP.lg,
    marginTop: SP.md,
    backgroundColor: C.pine,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
    alignItems: "center",
  },
  numberChip: {
    marginTop: 12,
    backgroundColor: C.heat,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  stepRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: { width: 2, flex: 1, minHeight: 18, backgroundColor: C.line, marginVertical: 2 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 3 },
});
