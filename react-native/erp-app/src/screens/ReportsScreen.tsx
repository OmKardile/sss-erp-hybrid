/** Reports — monthly income/expense/purchase comparison, expenses, top stock. */

import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { BackBtn, BarList, Card, EmptyState, Loader, StatTile, T } from "../components/ui";
import { rupees } from "../lib/format";
import type { DashboardResponse } from "../lib/types";

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthLabel(m: string): string {
  const [y, mm] = m.split("-");
  return `${MONTHS[Number(mm)] ?? mm} ${y.slice(2)}`;
}

export function ReportsScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { ops } = useErp();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ops
      .dashboard()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load reports"));
  }, [ops]);

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <Header onBack={() => navigation.goBack()} />
        <EmptyState emoji="📉" title="Can't load reports" sub={error} />
      </SafeAreaView>
    );
  }
  if (!data) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <Header onBack={() => navigation.goBack()} />
        <Loader />
      </SafeAreaView>
    );
  }

  const months = data.charts.monthlyComparison.slice(-6);
  const maxMonth = Math.max(
    1,
    ...months.map((m) => Math.max(m.income, m.expenses + m.purchases)),
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Header onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 130, gap: SP.lg, paddingHorizontal: SP.lg }}>
        {/* monthly comparison — grouped bars */}
        <Card>
          <T family="bodyBold" size={14} style={{ marginBottom: 12 }}>
            Monthly comparison · last 6 months
          </T>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, height: 140 }}>
            {months.map((m) => (
              <View key={m.month} style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 110 }}>
                  <View
                    accessibilityLabel={`${monthLabel(m.month)} income ${rupees(m.income)}`}
                    style={{
                      flex: 1,
                      height: `${Math.max(4, (m.income / maxMonth) * 100)}%`,
                      backgroundColor: C.pop,
                      borderWidth: 1.5,
                      borderColor: C.ink,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    accessibilityLabel={`${monthLabel(m.month)} expenses ${rupees(m.expenses)}`}
                    style={{
                      flex: 1,
                      height: `${Math.max(4, (m.expenses / maxMonth) * 100)}%`,
                      backgroundColor: C.heat,
                      borderWidth: 1.5,
                      borderColor: C.ink,
                      borderRadius: 4,
                    }}
                  />
                  <View
                    accessibilityLabel={`${monthLabel(m.month)} purchases ${rupees(m.purchases)}`}
                    style={{
                      flex: 1,
                      height: `${Math.max(4, (m.purchases / maxMonth) * 100)}%`,
                      backgroundColor: C.mango,
                      borderWidth: 1.5,
                      borderColor: C.ink,
                      borderRadius: 4,
                    }}
                  />
                </View>
                <T family="body" size={10} color={C.sage} align="center">
                  {monthLabel(m.month)}
                </T>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
            <Legend color={C.pop} label="Income" />
            <Legend color={C.heat} label="Expenses" />
            <Legend color={C.mango} label="Purchases" />
          </View>
        </Card>

        {/* profit per month */}
        <Card>
          <T family="bodyBold" size={14} style={{ marginBottom: 12 }}>
            Profit by month (income − expenses − purchases)
          </T>
          <View style={{ gap: 10 }}>
            {months.map((m) => (
              <View key={m.month} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <T family="bodyMedium" size={13}>
                  {monthLabel(m.month)}
                </T>
                <T family="bodyBold" size={13} color={m.profit >= 0 ? C.pine : C.heat}>
                  {rupees(m.profit)}
                </T>
              </View>
            ))}
          </View>
        </Card>

        {/* expenses */}
        <Card>
          <T family="bodyBold" size={14} style={{ marginBottom: 12 }}>
            Expenses by category
          </T>
          {data.charts.expenseDistribution.length === 0 ? (
            <T family="body" size={12} color={C.sage}>
              No expenses recorded.
            </T>
          ) : (
            <BarList
              items={data.charts.expenseDistribution.map((e) => ({ label: e.name, value: e.value }))}
            />
          )}
        </Card>

        {/* top stock value */}
        <Card>
          <T family="bodyBold" size={14} style={{ marginBottom: 12 }}>
            Top stock by value
          </T>
          <BarList items={data.charts.topProducts.map((p) => ({ label: `${p.name} (${p.stock})`, value: p.value }))} />
        </Card>

        <View style={{ flexDirection: "row", gap: SP.md }}>
          <StatTile label="Inventory value" value={rupees(data.summary.inventoryValue)} tone="white" />
          <StatTile label="Pending udhar" value={rupees(data.summary.pendingUdhar)} tone="heat" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: color, borderWidth: 1.5, borderColor: C.ink }} />
      <T family="body" size={11} color={C.sage}>
        {label}
      </T>
    </View>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <BackBtn onPress={onBack} label="Back to More" />
        <View>
          <T family="bodyMedium" size={11} color={C.heat}>
            ANALYTICS
          </T>
          <T family="display" size={22}>
            Reports
          </T>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  header: { paddingHorizontal: SP.lg, paddingTop: SP.md, paddingBottom: SP.md },
});
