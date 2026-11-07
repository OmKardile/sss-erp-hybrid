/** More — Customers, Reports, Settings hub. */

import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { T } from "../components/ui";

export function MoreScreen({
  onCustomers,
  onReports,
  onSettings,
}: {
  onCustomers: () => void;
  onReports: () => void;
  onSettings: () => void;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.header}>
        <T family="display" size={22}>
          More
        </T>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: SP.lg, gap: 10, paddingBottom: 130 }}>
        <Row icon="👥" title="Customers" sub="Directory + add new" onPress={onCustomers} />
        <Row icon="📊" title="Reports" sub="Monthly comparison, expenses, top stock" onPress={onReports} />
        <Row icon="⚙️" title="Settings" sub="Connection, mode, about" onPress={onSettings} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  title,
  sub,
  onPress,
}: {
  icon: string;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.85 : 1 }]}
    >
      <T size={22}>{icon}</T>
      <View style={{ flex: 1 }}>
        <T family="bodyBold" size={15}>
          {title}
        </T>
        <T family="body" size={12} color={C.sage}>
          {sub}
        </T>
      </View>
      <T family="bodyBold" size={16} color={C.sage}>
        →
      </T>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  header: { paddingHorizontal: SP.lg, paddingTop: SP.md, paddingBottom: SP.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.card,
    padding: 16,
  },
});
