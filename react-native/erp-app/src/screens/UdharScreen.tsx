/** Udhar — credit ledger: list by status, add entry, record payment, settle. */

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
import { Btn, EmptyState, Loader, T, font } from "../components/ui";
import { rupees } from "../lib/format";
import type { Udhar } from "../lib/types";

const STATUSES = ["ALL", "PENDING", "PARTIAL", "PAID"] as const;

export function UdharScreen() {
  const { ops } = useErp();
  const [items, setItems] = useState<Udhar[] | null>(null);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("ALL");
  const [refreshing, setRefreshing] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [payFor, setPayFor] = useState<Udhar | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // add form
  const [fName, setFName] = useState("");
  const [fPhone, setFPhone] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fAmount, setFAmount] = useState("");
  // payment form
  const [payAmount, setPayAmount] = useState("");

  const load = useCallback(async () => {
    try {
      setError(null);
      setItems(await ops.udhar(status));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load udhar");
    }
  }, [ops, status]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    if (!items) return { outstanding: 0, count: 0 };
    return {
      outstanding: items.reduce(
        (s, u) => s + Math.max(0, u.amount - u.payments.reduce((ps, p) => ps + p.amount, 0)),
        0,
      ),
      count: items.filter((u) => u.status !== "PAID").length,
    };
  }, [items]);

  const addEntry = async () => {
    if (!fName.trim() || !fAmount.trim()) {
      setError("Customer name and amount are required");
      return;
    }
    setBusy(true);
    try {
      await ops.createUdhar({
        customerName: fName.trim(),
        phone: fPhone.trim() || null,
        description: fDesc.trim() || "Credit purchase",
        amount: Number(fAmount) || 0,
      });
      setAddOpen(false);
      setFName("");
      setFPhone("");
      setFDesc("");
      setFAmount("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add entry");
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async () => {
    if (!payFor) return;
    const amount = Number(payAmount) || 0;
    if (amount <= 0) {
      setError("Enter a payment amount");
      return;
    }
    setBusy(true);
    try {
      await ops.addUdharPayment(payFor.id, amount, "App payment");
      setPayFor(null);
      setPayAmount("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  const settle = async (u: Udhar, next: "PAID" | "PENDING") => {
    setBusy(true);
    try {
      await ops.settleUdhar(u.id, next);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <T family="bodyMedium" size={11} color={C.heat}>
            CREDIT LEDGER
          </T>
          <T family="display" size={22}>
            Udhar
          </T>
        </View>
        <Btn title="+ Entry" size="md" onPress={() => setAddOpen(true)} style={{ height: 40 }} />
      </View>

      <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.md, gap: 10 }}>
        <View style={styles.summaryStrip}>
          <T family="bodyMedium" size={11} color="#9fd8b9">
            OUTSTANDING (THIS VIEW)
          </T>
          <T family="display" size={18} color={C.mango}>
            {rupees(totals.outstanding)} · {totals.count} open
          </T>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                accessibilityRole="button"
                onPress={() => setStatus(s)}
                style={[
                  styles.statusChip,
                  { backgroundColor: status === s ? C.ink : C.white },
                ]}
              >
                <T family="bodyMedium" size={12} color={status === s ? C.pop : C.ink}>
                  {s}
                </T>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: SP.lg, paddingBottom: 130, gap: 10 }}
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
        {error && !addOpen && !payFor ? (
          <T family="body" size={13} color={C.heat}>
            ✗ {error}
          </T>
        ) : null}
        {items === null ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState emoji="📖" title="No udhar entries" sub="Credit entries you add will appear here" />
        ) : (
          items.map((u) => {
            const paid = u.payments.reduce((s, p) => s + p.amount, 0);
            const outstanding = Math.max(0, u.amount - paid);
            return (
              <View key={u.id} style={styles.entry}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <T family="bodyBold" size={15}>
                      {u.customerName}
                    </T>
                    <T family="body" size={11} color={C.sage}>
                      {u.description} · {new Date(u.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      {u.phone ? ` · ${u.phone}` : ""}
                    </T>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          u.status === "PAID" ? C.pop : u.status === "PARTIAL" ? C.mango : C.heat,
                      },
                    ]}
                  >
                    <T family="bodyBold" size={10}>
                      {u.status}
                    </T>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <T family="body" size={12} color={C.sage} style={{ flex: 1 }}>
                    Total {rupees(u.amount)} · paid {rupees(paid)} ·{" "}
                    <T family="bodyBold" size={12} color={outstanding > 0 ? C.heat : C.pine}>
                      due {rupees(outstanding)}
                    </T>
                  </T>
                  {u.status !== "PAID" ? (
                    <>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          setPayAmount(String(outstanding));
                          setPayFor(u);
                        }}
                        style={styles.actionChip}
                      >
                        <T family="bodyBold" size={11}>
                          ₹ Pay
                        </T>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => settle(u, "PAID")}
                        style={styles.actionChip}
                      >
                        <T family="bodyBold" size={11}>
                          Settle ✓
                        </T>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => settle(u, "PENDING")}
                      style={styles.actionChipGhost}
                    >
                      <T family="bodyBold" size={11} color={C.sage}>
                        Reopen
                      </T>
                    </Pressable>
                  )}
                </View>
                {u.payments.length > 0 ? (
                  <View style={{ marginTop: 8, gap: 2, paddingLeft: 4 }}>
                    {u.payments.map((p) => (
                      <T key={p.id} family="body" size={10} color={C.sage}>
                        ↳ {rupees(p.amount)} on{" "}
                        {new Date(p.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {p.notes ? ` · ${p.notes}` : ""}
                      </T>
                    ))}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* add modal */}
      <Modal visible={addOpen} transparent animationType="slide" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <ScrollView contentContainerStyle={{ gap: 10 }} showsVerticalScrollIndicator={false}>
              <T family="display" size={18}>
                New udhar entry
              </T>
              <MField label="Customer name" value={fName} onChange={setFName} />
              <MField label="Phone (optional)" value={fPhone} onChange={setFPhone} keyboardType="phone-pad" />
              <MField label="Description" value={fDesc} onChange={setFDesc} placeholder="Monthly grocery — credit" />
              <MField label="Amount ₹" value={fAmount} onChange={setFAmount} keyboardType="number-pad" />
              {error ? (
                <T family="body" size={12} color={C.heat}>
                  ✗ {error}
                </T>
              ) : null}
              <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                <Btn title="Cancel" variant="ghost" onPress={() => setAddOpen(false)} style={{ flex: 1 }} />
                <Btn title="Add entry" variant="heat" loading={busy} onPress={addEntry} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* payment modal */}
      <Modal visible={!!payFor} transparent animationType="fade" onRequestClose={() => setPayFor(null)}>
        <View style={styles.modalCenterBg}>
          <View style={styles.modalCard}>
            <T family="display" size={17} align="center">
              Record payment
            </T>
            <T family="body" size={12} color={C.sage} align="center">
              {payFor?.customerName} · due {rupees(payFor ? Math.max(0, payFor.amount - payFor.payments.reduce((s, p) => s + p.amount, 0)) : 0)}
            </T>
            <View style={styles.inputWrap}>
              <TextInput
                accessibilityLabel="Payment amount"
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="number-pad"
                style={[styles.input, { fontFamily: font("body") }]}
              />
            </View>
            {error ? (
              <T family="body" size={12} color={C.heat} align="center">
                {error}
              </T>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
              <Btn title="Cancel" variant="ghost" onPress={() => setPayFor(null)} style={{ flex: 1 }} />
              <Btn title="Record" variant="heat" loading={busy} onPress={recordPayment} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function MField({
  label,
  value,
  onChange,
  keyboardType,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: "default" | "phone-pad" | "number-pad";
  placeholder?: string;
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
          placeholder={placeholder}
          placeholderTextColor={C.sage}
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
  summaryStrip: {
    backgroundColor: C.pine,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: 14,
    gap: 2,
  },
  statusChip: {
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  entry: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.card,
    padding: 14,
  },
  statusPill: {
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  actionChip: {
    backgroundColor: C.pop,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  actionChipGhost: {
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalBg: { flex: 1, backgroundColor: "rgba(14,27,18,0.66)", justifyContent: "flex-end" },
  modalCenterBg: {
    flex: 1,
    backgroundColor: "rgba(14,27,18,0.66)",
    alignItems: "center",
    justifyContent: "center",
    padding: SP.xl,
  },
  modalCard: {
    backgroundColor: C.cream,
    borderTopLeftRadius: R.card,
    borderTopRightRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
    paddingBottom: 36,
    width: "100%",
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
