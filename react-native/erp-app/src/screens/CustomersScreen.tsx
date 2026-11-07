/** Customers — directory + add new. */

import React, { useCallback, useEffect, useState } from "react";
import { Modal, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { Btn, BackBtn, EmptyState, Loader, SearchBar, T, font } from "../components/ui";
import type { Customer } from "../lib/types";

export function CustomersScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { ops } = useErp();
  const [items, setItems] = useState<Customer[] | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await ops.customers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customers");
    }
  }, [ops]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!fName.trim()) {
      setError("Name is required");
      return;
    }
    setBusy(true);
    try {
      await ops.createCustomer({
        name: fName.trim(),
        phone: fPhone.trim() || null,
        address: fAddress.trim() || null,
      });
      setAddOpen(false);
      setFName("");
      setFPhone("");
      setFAddress("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add customer");
    } finally {
      setBusy(false);
    }
  };

  const filtered = (items ?? []).filter((c) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone ?? "").toLowerCase().includes(q) ||
      (c.address ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <BackBtn onPress={() => navigation.goBack()} label="Back to More" />
          <View>
            <T family="bodyMedium" size={11} color={C.heat}>
              DIRECTORY
            </T>
            <T family="display" size={22}>
              Customers
            </T>
          </View>
        </View>
        <Btn title="+ Add" size="md" onPress={() => setAddOpen(true)} style={{ height: 40 }} />
      </View>

      <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.md }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search customers…" />
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
        {items === null ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <EmptyState emoji="👥" title="No customers" sub="Add your regulars so udhar is easy" />
        ) : (
          filtered.map((c) => (
            <View key={c.id} style={styles.row}>
              <View style={styles.avatar}>
                <T family="bodyBold" size={15} color={C.cream}>
                  {c.name.slice(0, 1).toUpperCase()}
                </T>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T family="bodyBold" size={14}>
                  {c.name}
                </T>
                <T family="body" size={11} color={C.sage}>
                  {c.phone ?? "no phone"} · {c.address ?? "—"}
                </T>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
              <T family="display" size={18}>
                New customer
              </T>
              <Field label="Name" value={fName} onChange={setFName} />
              <Field label="Phone (optional)" value={fPhone} onChange={setFPhone} keyboardType="phone-pad" />
              <Field label="Address (optional)" value={fAddress} onChange={setFAddress} />
              {error ? (
                <T family="body" size={12} color={C.heat}>
                  ✗ {error}
                </T>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <Btn title="Cancel" variant="ghost" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
                <Btn title="Add" variant="heat" loading={busy} onPress={add} style={{ flex: 1 }} />
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
  keyboardType?: "default" | "phone-pad";
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.pine,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBg: { flex: 1, backgroundColor: "rgba(14,27,18,0.66)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: C.cream,
    borderTopLeftRadius: R.card,
    borderTopRightRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
    paddingBottom: 36,
  },
  inputWrap: {
    height: 46,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 14, color: C.ink, padding: 0 },
});
