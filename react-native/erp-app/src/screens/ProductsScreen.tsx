/** Products — searchable inventory, low-stock filter, add/edit modal. */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { Btn, EmptyState, Loader, SearchBar, T, font } from "../components/ui";
import { rupees } from "../lib/format";
import type { Product } from "../lib/types";

type Draft = {
  id?: string;
  name: string;
  brand: string;
  category: string;
  purchasePrice: string;
  sellingPrice: string;
  quantity: string;
  unitType: string;
  minStockAlert: string;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  brand: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
  unitType: "pcs",
  minStockAlert: "5",
};

export function ProductsScreen() {
  const { ops } = useErp();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [query, setQuery] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setProducts(await ops.products());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load products");
    }
  }, [ops]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products;
    if (lowOnly) list = list.filter((p) => p.quantity <= p.minStockAlert);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query, lowOnly]);

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      setError("Product name is required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await ops.saveProduct({
        id: draft.id,
        name: draft.name.trim(),
        brand: draft.brand.trim() || null,
        category: draft.category.trim() || null,
        purchasePrice: Number(draft.purchasePrice) || 0,
        sellingPrice: Number(draft.sellingPrice) || 0,
        quantity: Number(draft.quantity) || 0,
        unitType: draft.unitType.trim() || "pcs",
        minStockAlert: Number(draft.minStockAlert) || 0,
      });
      setDraft(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const editDraft = (p: Product): Draft => ({
    id: p.id,
    name: p.name,
    brand: p.brand ?? "",
    category: p.category ?? "",
    purchasePrice: String(p.purchasePrice),
    sellingPrice: String(p.sellingPrice),
    quantity: String(p.quantity),
    unitType: p.unitType,
    minStockAlert: String(p.minStockAlert),
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <T family="bodyMedium" size={11} color={C.heat}>
            INVENTORY
          </T>
          <T family="display" size={22}>
            Products
          </T>
        </View>
        <Btn title="+ Add" size="md" onPress={() => setDraft({ ...EMPTY_DRAFT })} style={{ height: 40 }} />
      </View>

      <View style={{ paddingHorizontal: SP.lg, gap: 10, marginBottom: SP.md }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search inventory…" />
        <Pressable
          accessibilityRole="button"
          onPress={() => setLowOnly((v) => !v)}
          style={[
            styles.lowChip,
            { backgroundColor: lowOnly ? C.heat : C.white, borderColor: C.ink },
          ]}
        >
          <T family="bodyMedium" size={12} color={lowOnly ? C.cream : C.ink}>
            ⚠ Low stock only
          </T>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SP.lg, paddingBottom: 130, gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={C.heat}
          />
        }
      >
        {error && !draft ? (
          <T family="body" size={13} color={C.heat}>
            ✗ {error}
          </T>
        ) : null}
        {products === null ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState emoji="📦" title="Nothing here" sub={lowOnly ? "No products at/below alert level" : "No products match your search"} />
        ) : (
          filtered.map((p) => {
            const low = p.quantity <= p.minStockAlert;
            return (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                accessibilityLabel={`Edit ${p.name}`}
                onPress={() => setDraft(editDraft(p))}
                style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <T family="bodyBold" size={14} numberOfLines={1}>
                    {p.name}
                  </T>
                  <T family="body" size={11} color={C.sage}>
                    {p.brand ?? "—"} · {p.unitType} · buy {rupees(p.purchasePrice)}
                  </T>
                </View>
                <View style={{ alignItems: "flex-end", gap: 2 }}>
                  <T family="bodyBold" size={14}>
                    {rupees(p.sellingPrice)}
                  </T>
                  <T family="bodyBold" size={12} color={low ? C.heat : C.sage}>
                    {low ? "⚠ " : ""}
                    {p.quantity} {p.unitType}
                  </T>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* add/edit modal */}
      <Modal visible={!!draft} transparent animationType="slide" onRequestClose={() => setDraft(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              <T family="display" size={18}>
                {draft?.id ? "Edit product" : "Add product"}
              </T>
              <Field label="Name" value={draft?.name ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, name: v } : d))} />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Brand" value={draft?.brand ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, brand: v } : d))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Category" value={draft?.category ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, category: v } : d))} />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Purchase ₹" value={draft?.purchasePrice ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, purchasePrice: v } : d))} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Selling ₹" value={draft?.sellingPrice ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, sellingPrice: v } : d))} keyboardType="number-pad" />
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Stock qty" value={draft?.quantity ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, quantity: v } : d))} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Unit" value={draft?.unitType ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, unitType: v } : d))} />
                </View>
              </View>
              <Field label="Low-stock alert at" value={draft?.minStockAlert ?? ""} onChange={(v) => setDraft((d) => (d ? { ...d, minStockAlert: v } : d))} keyboardType="number-pad" />
              {error ? (
                <T family="body" size={12} color={C.heat}>
                  ✗ {error}
                </T>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <Btn title="Cancel" variant="ghost" onPress={() => setDraft(null)} style={{ flex: 1 }} />
                <Btn title="Save" variant="heat" loading={busy} onPress={save} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={{ gap: 4 }}>
      <T family="bodyMedium" size={11} color={C.sage}>
        {label}
      </T>
      <View style={styles.inputWrap}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType}
          style={[styles.input, { fontFamily: font("body") }]}
        />
      </View>
    </View>
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
  lowChip: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 12,
  },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(14,27,18,0.66)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.cream,
    borderTopLeftRadius: R.card,
    borderTopRightRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
    paddingBottom: 130,
    maxHeight: "88%",
  },
  inputWrap: {
    height: 44,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  input: { fontSize: 14, color: C.ink, padding: 0 },
});
