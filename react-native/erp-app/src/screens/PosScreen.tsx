/** POS — search products, build a sale, discount, payment method, record. */

import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { Btn, EmptyState, Loader, SearchBar, T, font } from "../components/ui";
import { rupees } from "../lib/format";
import type { Product } from "../lib/types";

interface Line {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Udhar (credit)"];

export function PosScreen() {
  const { ops } = useErp();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState("");
  const [method, setMethod] = useState("Cash");
  const [customer, setCustomer] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ total: number; method: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    ops
      .products()
      .then(setProducts)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load products"));
  }, [ops]);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q),
    );
  }, [products, query]);

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);
  const discountVal = Math.min(subtotal, Number(discount) || 0);
  const total = Math.max(0, subtotal - discountVal);

  const addToSale = (p: Product) => {
    setDone(null);
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === p.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { productId: p.id, name: p.name, price: p.sellingPrice, quantity: 1 }];
    });
  };

  const setQty = (productId: string, qty: number) =>
    setLines((prev) =>
      qty <= 0 ? prev.filter((l) => l.productId !== productId) : prev.map((l) => (l.productId === productId ? { ...l, quantity: qty } : l)),
    );

  const record = async () => {
    if (lines.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      await ops.recordSale({
        items: lines,
        customerName: customer.trim() || null,
        paymentMethod: method.startsWith("Udhar") ? "Udhar" : method,
        discount: discountVal,
        notes: method.startsWith("Udhar") ? "Credit sale (udhar)" : null,
      });
      setDone({ total, method });
      setLines([]);
      setDiscount("");
      setCustomer("");
      setMethod("Cash");
      ops.products().then(setProducts).catch(() => {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to record sale");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <T family="bodyMedium" size={11} color={C.heat}>
            POINT OF SALE
          </T>
          <T family="display" size={22}>
            New sale
          </T>
        </View>
      </View>

      <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.md }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search product / brand / SKU…" />
      </View>

      <View style={{ paddingHorizontal: SP.lg, flex: 1 }}>
        {error ? (
          <T family="body" size={13} color={C.heat}>
            ✗ {error}
          </T>
        ) : null}
        {products === null ? (
          <Loader />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SP.lg, gap: 8 }}>
            {filtered.length === 0 ? (
              <EmptyState emoji="🔍" title="No products match" sub="Try a different search" />
            ) : (
              filtered.map((p) => {
                const inSale = lines.find((l) => l.productId === p.id);
                const low = p.quantity <= p.minStockAlert;
                return (
                  <Pressable
                    key={p.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${p.name} to sale`}
                    onPress={() => addToSale(p)}
                    style={({ pressed }) => [styles.productRow, { opacity: pressed ? 0.85 : 1 }]}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <T family="bodyBold" size={14} numberOfLines={1}>
                        {p.name}
                      </T>
                      <T family="body" size={11} color={C.sage}>
                        {p.brand ?? "—"} · {p.unitType} · stock{" "}
                        <T family="bodyBold" size={11} color={low ? C.heat : C.sage}>
                          {p.quantity}
                        </T>
                      </T>
                    </View>
                    <T family="bodyBold" size={14}>
                      {rupees(p.sellingPrice)}
                    </T>
                    {inSale ? (
                      <View style={styles.inSaleChip}>
                        <T family="bodyBold" size={11} color={C.cream}>
                          ×{inSale.quantity}
                        </T>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        )}
      </View>

      {/* sale summary bar */}
      <View style={styles.salePanel}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <T family="bodyBold" size={15}>
            Bill · {lines.reduce((s, l) => s + l.quantity, 0)} items
          </T>
          {lines.length > 0 ? (
            <Pressable hitSlop={10} onPress={() => setLines([])}>
              <T family="bodyBold" size={12} color={C.heat}>
                CLEAR
              </T>
            </Pressable>
          ) : null}
        </View>
        {lines.map((l) => (
          <View key={l.productId} style={styles.lineRow}>
            <T family="body" size={12} style={{ flex: 1 }} numberOfLines={1}>
              {l.name}
            </T>
            <View style={styles.qtyCtl}>
              <Pressable hitSlop={8} onPress={() => setQty(l.productId, l.quantity - 1)}>
                <T family="bodyBold" size={14} color={C.pop}>
                  −
                </T>
              </Pressable>
              <T family="bodyBold" size={12} style={{ minWidth: 20, textAlign: "center" }}>
                {l.quantity}
              </T>
              <Pressable hitSlop={8} onPress={() => setQty(l.productId, l.quantity + 1)}>
                <T family="bodyBold" size={14} color={C.pop}>
                  +
                </T>
              </Pressable>
            </View>
            <T family="bodyMedium" size={12} style={{ minWidth: 64, textAlign: "right" }}>
              {rupees(l.price * l.quantity)}
            </T>
          </View>
        ))}
        {lines.length > 0 ? (
          <>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <View style={styles.miniInputWrap}>
                <TextInput
                  accessibilityLabel="Discount"
                  placeholder="Discount ₹"
                  placeholderTextColor={C.sage}
                  value={discount}
                  onChangeText={setDiscount}
                  keyboardType="number-pad"
                  style={[styles.miniInput, { fontFamily: font("body") }]}
                />
              </View>
              <View style={[styles.miniInputWrap, { flex: 1.6 }]}>
                <TextInput
                  accessibilityLabel="Customer name"
                  placeholder="Customer (optional)"
                  placeholderTextColor={C.sage}
                  value={customer}
                  onChangeText={setCustomer}
                  style={[styles.miniInput, { fontFamily: font("body") }]}
                />
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {PAYMENT_METHODS.map((m) => (
                  <Pressable
                    key={m}
                    accessibilityRole="button"
                    onPress={() => setMethod(m)}
                    style={[
                      styles.methodChip,
                      { backgroundColor: method === m ? C.ink : C.white },
                    ]}
                  >
                    <T family="bodyMedium" size={12} color={method === m ? C.pop : C.ink}>
                      {m}
                    </T>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <T family="body" size={11} color={C.sage}>
              {discountVal > 0 ? `Subtotal ${rupees(subtotal)} − ${rupees(discountVal)}` : "Total"}
            </T>
            <T family="display" size={19}>
              {rupees(total)}
            </T>
          </View>
          <Btn
            title="Record sale"
            variant="heat"
            disabled={lines.length === 0}
            loading={busy}
            onPress={record}
            style={{ flex: 1.2 }}
          />
        </View>
      </View>

      {/* success modal */}
      <Modal visible={!!done} transparent animationType="fade" onRequestClose={() => setDone(null)}>
        <Pressable style={styles.modalBg} onPress={() => setDone(null)}>
          <View style={styles.modalCard}>
            <T size={44}>✅</T>
            <T family="display" size={20} align="center">
              Sale recorded
            </T>
            <T family="body" size={13} color={C.sage} align="center">
              {rupees(done?.total ?? 0)} · {done?.method}{"\n"}Stock updated, income booked.
            </T>
            <Btn title="Done" onPress={() => setDone(null)} style={{ alignSelf: "stretch", marginTop: 12 }} />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.lg,
    paddingTop: SP.md,
    paddingBottom: SP.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 12,
  },
  inSaleChip: {
    backgroundColor: C.heat,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  salePanel: {
    marginBottom: 82,
    backgroundColor: C.pine,
    borderTopLeftRadius: R.card,
    borderTopRightRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.lg,
    paddingBottom: 26,
    gap: 6,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 2,
  },
  qtyCtl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  miniInputWrap: {
    flex: 1,
    height: 40,
    borderRadius: R.pill,
    backgroundColor: C.cream,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  miniInput: { fontSize: 13, color: C.ink, padding: 0 },
  methodChip: {
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(14,27,18,0.66)",
    alignItems: "center",
    justifyContent: "center",
    padding: SP.xl,
  },
  modalCard: {
    backgroundColor: C.cream,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
});
