/** Login — passkey gate (live mode) or one-tap demo mode. */

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useErp } from "../state/erp";
import { Btn, T, font } from "../components/ui";
import { TextInput } from "react-native";

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { login } = useErp();
  const [base, setBase] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!base.trim() || !passkey.trim()) {
      setError("ERP URL and passkey are both required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(base.trim(), passkey.trim());
      onLoggedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: SP.xl }}>
        <View style={{ alignItems: "center", gap: 8, marginBottom: SP.xl }}>
          <View style={styles.mark}>
            <T family="display" size={30} color={C.pop}>
              S
            </T>
          </View>
          <T family="display" size={24} align="center">
            SSS ERP
          </T>
          <T family="body" size={13} color={C.sage} align="center">
            Shubham Super Shopee · Admin{"\n"}Point of sale · Inventory · Udhar · Reports
          </T>
        </View>

        <View style={{ gap: 12 }}>
          <T family="bodyMedium" size={12}>
            ERP URL (your deployed ERP)
          </T>
          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel="ERP URL"
              placeholder="https://sss-erp.vercel.app"
              placeholderTextColor={C.sage}
              value={base}
              onChangeText={(v) => {
                setBase(v);
                setError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              style={[styles.input, { fontFamily: font("body") }]}
            />
          </View>
          <T family="bodyMedium" size={12}>
            Passkey
          </T>
          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel="Passkey"
              placeholder="••••••••"
              placeholderTextColor={C.sage}
              value={passkey}
              onChangeText={(v) => {
                setPasskey(v);
                setError(null);
              }}
              secureTextEntry
              style={[styles.input, { fontFamily: font("body") }]}
            />
          </View>
          {error ? (
            <T family="body" size={13} color={C.heat}>
              ✗ {error}
            </T>
          ) : null}
          <Btn title="Unlock ERP" variant="heat" loading={busy} onPress={submit} />
          <Pressable
            accessibilityRole="button"
            onPress={onLoggedIn}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, alignItems: "center", padding: 12 })}
          >
            <T family="bodyMedium" size={13} color={C.sage}>
              Explore with demo data instead →
            </T>
          </Pressable>
        </View>

        <T family="body" size={11} color={C.sage} align="center" style={{ marginTop: SP.xxl }}>
          The passkey is stored only on this device and exchanged for the
          same session cookie the web ERP uses.
        </T>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  mark: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: C.pine,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrap: {
    height: 50,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 14, color: C.ink, padding: 0 },
});
