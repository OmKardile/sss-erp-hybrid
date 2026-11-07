/** Dashboard — today/month stats, 30-day income sparkbars, low stock, udhar. */

import React, { useCallback, useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { BarList, Card, EmptyState, Loader, StatTile, T } from "../components/ui";
import { rupees } from "../lib/format";
import type { DashboardResponse } from "../lib/types";

export function DashboardScreen({ onOpenUdhar }: { onOpenUdhar: () => void }) {
  const { ops, live } = useErp();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      setData(await ops.dashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    }
  }, [ops]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <Header live={live} />
        <EmptyState emoji="📡" title="Can't reach the ERP" sub={error} />
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <Header live={live} />
        <Loader />
      </SafeAreaView>
    );
  }

  const { summary, charts } = data;
  const incomeBars = charts.last30DaysIncome.slice(-14);
  const maxIncome = Math.max(1, ...incomeBars.map((d) => d.total));

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Header live={live} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 130 }}
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
        {/* today + month */}
        <View style={{ flexDirection: "row", gap: SP.md, paddingHorizontal: SP.lg }}>
          <StatTile label="Today · in" value={rupees(summary.todayIncome)} tone="pop" />
          <StatTile label="Today · out" value={rupees(summary.todayExpenses)} tone="heat" />
        </View>
        <View style={{ flexDirection: "row", gap: SP.md, paddingHorizontal: SP.lg, marginTop: SP.md }}>
          <StatTile
            label="Month · income"
            value={rupees(summary.monthlyIncome)}
            tone="white"
          />
          <StatTile
            label="Month · profit"
            value={rupees(summary.monthlyProfit)}
            tone={summary.monthlyProfit >= 0 ? "mango" : "heat"}
            hint={`exp ${rupees(summary.monthlyExpenses)} · pur ${rupees(summary.monthlyPurchases)}`}
          />
        </View>

        {/* 14-day income bars */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg }}>
          <Card>
            <T family="bodyBold" size={14} style={{ marginBottom: 10 }}>
              Counter + online income · last 14 days
            </T>
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 96 }}>
              {incomeBars.length === 0 ? (
                <T family="body" size={12} color={C.sage}>
                  No income recorded yet.
                </T>
              ) : (
                incomeBars.map((d) => (
                  <View key={d.date} style={{ flex: 1, justifyContent: "flex-end" }}>
                    <View
                      accessibilityLabel={`${d.date}: ${rupees(d.total)}`}
                      style={{
                        height: `${Math.max(6, (d.total / maxIncome) * 100)}%`,
                        backgroundColor: C.heat,
                        borderRadius: 4,
                        borderWidth: 1.5,
                        borderColor: C.ink,
                      }}
                    />
                  </View>
                ))
              )}
            </View>
            {incomeBars.length > 0 ? (
              <T family="body" size={10} color={C.sage} style={{ marginTop: 6 }}>
                {incomeBars[0].date.split("T")[0]} → {incomeBars[incomeBars.length - 1].date.split("T")[0]} · peak {rupees(maxIncome)}
              </T>
            ) : null}
          </Card>
        </View>

        {/* inventory + udhar */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg, gap: SP.md }}>
          <View style={{ flexDirection: "row", gap: SP.md }}>
            <StatTile
              label="Inventory value"
              value={rupees(summary.inventoryValue)}
              tone="white"
              hint={`${summary.totalProducts} products · ${summary.inventoryCount} units`}
            />
            <StatTile
              label="Low stock"
              value={String(summary.lowStockCount)}
              tone={summary.lowStockCount > 0 ? "heat" : "white"}
              hint="at/below alert level"
            />
          </View>
          <Pressable accessibilityRole="button" onPress={onOpenUdhar}>
            <Card pine style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <T family="bodyMedium" size={11} color="#9fd8b9">
                  PENDING UDHAR
                </T>
                <T family="display" size={20} color={C.mango}>
                  {rupees(summary.pendingUdhar)}
                </T>
                <T family="body" size={11} color="#9fd8b9">
                  {summary.pendingUdharCount} open credit entries →
                </T>
              </View>
              <T size={34}>📖</T>
            </Card>
          </Pressable>
        </View>

        {/* expense breakdown */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg }}>
          <Card>
            <T family="bodyBold" size={14} style={{ marginBottom: 12 }}>
              Expenses by category
            </T>
            {charts.expenseDistribution.length === 0 ? (
              <T family="body" size={12} color={C.sage}>
                No expenses recorded yet.
              </T>
            ) : (
              <BarList
                items={charts.expenseDistribution.map((e) => ({ label: e.name, value: e.value }))}
              />
            )}
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ live }: { live: boolean }) {
  return (
    <View style={styles.header}>
      <View>
        <T family="bodyMedium" size={11} color={C.heat}>
          SHUBHAM SUPER SHOPEE
        </T>
        <T family="display" size={22}>
          Dashboard
        </T>
      </View>
      <View style={[styles.modeChip, { backgroundColor: live ? C.pop : C.mango }]}>
        <T family="bodyBold" size={11}>
          {live ? "LIVE" : "DEMO"}
        </T>
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
    paddingBottom: SP.lg,
  },
  modeChip: {
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
