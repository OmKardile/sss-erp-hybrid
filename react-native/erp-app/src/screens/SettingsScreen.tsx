/** ERP settings — mode, connection info, logout, about. */

import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { useSession } from "../nav";
import { BackBtn, Btn, Card, T } from "../components/ui";

export function SettingsScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { live, apiBase, logout } = useErp();
  const session = useSession();

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: SP.lg, gap: SP.lg, paddingBottom: 48 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <BackBtn onPress={() => navigation.goBack()} label="Back to More" />
          <View>
            <T family="display" size={22}>
              Settings
            </T>
          </View>
        </View>

        <Card pine>
          <T family="bodyMedium" size={11} color="#9fd8b9">
            MODE
          </T>
          <T family="display" size={18} color={live ? C.pop : C.mango}>
            {live ? "LIVE — connected" : "DEMO — sample data"}
          </T>
          {live ? (
            <T family="body" size={12} color="#cfe3d6" style={{ marginTop: 4 }}>
              {apiBase}
            </T>
          ) : (
            <T family="body" size={12} color="#cfe3d6" style={{ marginTop: 4 }}>
              Every number you see is generated locally. Nothing touches your real ERP.
            </T>
          )}
        </Card>

        {live ? (
          <Btn
            title="Disconnect & clear passkey"
            variant="ghost"
            onPress={() => {
              logout();
              session.reset();
            }}
          />
        ) : (
          <Btn
            title="Connect to the live ERP"
            variant="heat"
            onPress={() => session.reset()}
          />
        )}
        <Card>
          <T family="bodyBold" size={14} style={{ marginBottom: 8 }}>
            About this app
          </T>
          <T family="body" size={12} color={C.sage} style={{ lineHeight: 19 }}>
            SSS ERP · v1.0.0{"\n"}
            React Native companion to the web ERP of Shubham Super Shopee (Pune).{"\n"}
            Point of sale · inventory · udhar credit ledger · customers · reports.{"\n\n"}
            The app speaks the same API as the web admin — point it at your ERP
            deployment, unlock with the shop passkey, and your live data flows.
          </T>
        </Card>

        <T family="body" size={11} color={C.sage} align="center">
          Crafted with ♥ for Bro · Designed &amp; developed by Omkar Kardile
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
});
