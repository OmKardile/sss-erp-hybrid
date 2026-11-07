/** Orders — lookup any order by number (live) + local demo order history. */

import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart, type LocalOrder } from "../state/cart";
import { Btn, EmptyState, T, font } from "../components/ui";
import { rupees } from "../lib/format";
import { formatDateFor } from "../lib/i18n";
import type { OrderView } from "../lib/types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { OrdersStackParams } from "../nav";

type Props = NativeStackScreenProps<OrdersStackParams, "Orders">;

export function OrdersScreen({ navigation }: Props) {
  const { t, api, locale, isMr } = useApp();
  const { localOrders } = useCart();
  const [query, setQuery] = useState("");
  const [found, setFound] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const lookup = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    setFound(null);
    try {
      if (api.isLive) {
        const order = await api.order(q);
        setFound(order);
      } else {
        // demo mode — match against local history
        const local = localOrders.find((o) => o.orderNumber === q.toUpperCase());
        if (!local) throw new Error("not found");
        const view: OrderView = {
          id: `local_${local.orderNumber}`,
          orderNumber: local.orderNumber,
          customerName: "—",
          customerPhone: "—",
          customerEmail: null,
          customerAddress: "—",
          city: null,
          pincode: null,
          subtotal: local.total,
          deliveryFee: 0,
          total: local.total,
          couponCode: null,
          discountTotal: 0,
          paymentMethod: local.paymentMethod,
          paymentStatus: "PENDING",
          orderStatus: "PLACED",
          notes: null,
          createdAt: local.createdAt,
          items: local.items.map((it, i) => ({ id: `i${i}`, ...it })),
          source: "local",
        };
        setFound(view);
      }
    } catch {
      setError(q ? t("home.error-title") : null);
    } finally {
      setSearching(false);
    }
  }, [query, api, localOrders, t]);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <T family="display" size={22} style={{ paddingHorizontal: SP.lg, paddingTop: SP.lg, paddingBottom: SP.md }}>
        {t("order.items")} · {isMr ? "ऑर्डर" : "Orders"}
      </T>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        {/* lookup */}
        <View style={{ paddingHorizontal: SP.lg, gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={styles.searchWrap}>
              <TextInput
                accessibilityLabel="Order number"
                placeholder="SSS-20261106-1234"
                placeholderTextColor={C.sage}
                value={query}
                onChangeText={(v) => {
                  setQuery(v);
                  setError(null);
                  setFound(null);
                }}
                autoCapitalize="characters"
                style={[styles.searchInput, { fontFamily: font("body", isMr) }]}
                onSubmitEditing={lookup}
                returnKeyType="search"
              />
            </View>
            <Btn title="🔍" size="md" onPress={lookup} loading={searching} style={{ width: 56, height: 48, paddingHorizontal: 0 }} />
          </View>
          {error ? (
            <T family="body" size={13} color={C.heat}>
              ✗ {query.trim()} — {t("home.empty-title")}
            </T>
          ) : null}
          {found ? (
            <Pressable
              accessibilityRole="button"
              style={styles.foundCard}
              onPress={() => navigation.navigate("OrderConfirm", { order: found })}
            >
              <View style={{ flex: 1 }}>
                <T family="bodyBold" size={14}>
                  {found.orderNumber}
                </T>
                <T family="body" size={12} color={C.sage}>
                  {formatDateFor(locale, found.createdAt)}
                </T>
              </View>
              <T family="bodyBold" size={14} color={C.heat}>
                {rupees(found.total)} →
              </T>
            </Pressable>
          ) : null}
        </View>

        {/* local history */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl, gap: 10 }}>
          <T family="bodyBold" size={15}>
            {isMr ? "तुमच्या ऑर्डर्स" : "Your orders"}
          </T>
          {localOrders.length === 0 ? (
            <EmptyState emoji="📦" title={isMr ? "अजून ऑर्डर नाही" : "No orders yet"} sub={isMr ? "खरेदी करा आणि इथे इतिहास दिसेल" : "Place an order and it will show up here"} />
          ) : (
            localOrders.map((o) => <LocalOrderRow key={o.orderNumber} order={o} locale={locale} />)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LocalOrderRow({ order, locale }: { order: LocalOrder; locale: "en" | "mr" }) {
  return (
    <View style={styles.foundCard}>
      <View style={{ flex: 1 }}>
        <T family="bodyBold" size={14}>
          {order.orderNumber}
        </T>
        <T family="body" size={12} color={C.sage}>
          {order.items.length} items · {formatDateFor(locale, order.createdAt)}
        </T>
      </View>
      <T family="bodyBold" size={14} color={C.heat}>
        {rupees(order.total)}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  searchWrap: {
    flex: 1,
    height: 48,
    borderRadius: R.pill,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchInput: { fontSize: 14, color: C.ink, padding: 0 },
  foundCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.md,
    padding: 14,
  },
});
