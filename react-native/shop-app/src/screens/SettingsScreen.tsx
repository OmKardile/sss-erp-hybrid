/** Settings — language, live API wiring, store info, about. */

import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart } from "../state/cart";
import { Btn, T, font } from "../components/ui";
import { ShopApi } from "../lib/api";

export function SettingsScreen() {
  const { t, locale, setLocale, apiBase, setApiBase, isMr, api } = useApp();
  const cart = useCart();
  const [draft, setDraft] = useState(apiBase);
  const [probe, setProbe] = useState<string | null>(null);
  const [probing, setProbing] = useState(false);

  const saveAndProbe = async () => {
    setApiBase(draft);
    setProbing(true);
    setProbe(null);
    try {
      const health = await new ShopApi(draft).health();
      setProbe(
        health.ok
          ? `✓ Connected${health.products != null ? ` — ${health.products} products` : ""}`
          : "✗ No healthy API at that URL",
      );
    } catch {
      setProbe("✗ Could not reach that URL");
    } finally {
      setProbing(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <T family="display" size={22} style={{ paddingHorizontal: SP.lg, paddingTop: SP.lg, paddingBottom: SP.lg }}>
          {locale === "mr" ? "सेटिंग्ज" : "Settings"}
        </T>

        {/* language */}
        <Section title={locale === "mr" ? "भाषा" : "Language"}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <LangOption label="English" sub="EN" active={locale === "en"} onPress={() => setLocale("en")} />
            <LangOption label="मराठी" sub="MR" active={locale === "mr"} onPress={() => setLocale("mr")} />
          </View>
          <T family="body" size={12} color={C.sage} style={{ marginTop: 8 }}>
            {t("lang.toggle-aria-en")}
          </T>
        </Section>

        {/* live API */}
        <Section title={locale === "mr" ? "लाइव्ह स्टोर API" : "Live store API"}>
          <T family="body" size={12} color={C.sage} style={{ marginBottom: 8 }}>
            {locale === "mr"
              ? "वेब स्टोरचा URL टाका (उदा. https://shubham-super-shopee.vercel.app). रिकामा सोडल्यास डेमो कॅटलॉग वापरला जातो."
              : "Paste your deployed storefront URL (e.g. https://shubham-super-shopee.vercel.app). Leave empty to use the bundled demo catalog."}
          </T>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={styles.inputWrap}>
              <TextInput
                accessibilityLabel="API base URL"
                placeholder="https://your-shop.vercel.app"
                placeholderTextColor={C.sage}
                value={draft}
                onChangeText={setDraft}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={[styles.input, { fontFamily: font("body", isMr) }]}
              />
            </View>
            <Btn title={probing ? "…" : locale === "mr" ? "जोडा" : "Connect"} size="md" onPress={saveAndProbe} style={{ height: 48 }} />
          </View>
          {probe ? (
            <T family="body" size={13} color={probe.startsWith("✓") ? C.pine : C.heat} style={{ marginTop: 8 }}>
              {probe}
            </T>
          ) : null}
          <View style={[styles.modeChip, { backgroundColor: api.isLive ? C.pop : C.mango }]}>
            <T family="bodyBold" size={12}>
              {api.isLive ? "LIVE MODE" : "DEMO MODE"}
            </T>
          </View>
        </Section>

        {/* store info */}
        <Section title={locale === "mr" ? "दुकान" : "Store"}>
          <InfoRow label={t("mnav.home")} value="Shubham Super Shopee" />
          <InfoRow label="📞" value="+91 98765 43210" />
          <InfoRow label="📍" value="Pune, Maharashtra, India" />
          <InfoRow label="🛵" value={locale === "mr" ? "सुमारे 2 तासांत डिलिव्हरी" : "Delivery in about 2 hours"} />
          <InfoRow label="💳" value="COD · UPI (shubhamsupershopee@upi)" />
        </Section>

        {/* danger zone */}
        <Section title={locale === "mr" ? "गाडी" : "Cart"}>
          <T family="body" size={12} color={C.sage}>
            {cart.itemCount} {t("header.basket-items")} · {t("cart.total")}: ₹{cart.subtotal}
          </T>
          <Btn
            title={locale === "mr" ? "गाडी रिकामी करा" : "Clear cart"}
            variant="ghost"
            size="md"
            onPress={() => cart.clear()}
            style={{ marginTop: 10, alignSelf: "flex-start" }}
          />
        </Section>

        {/* about */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.md }}>
          <T family="body" size={11} color={C.sage} align="center">
            Shubham Super Shopee · v1.0.0{"\n"}
            React Native companion to the web storefront{"\n"}
            Crafted with ♥ for Bro · Designed &amp; developed by Omkar Kardile
          </T>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.xl, gap: 10 }}>
      <T family="bodyBold" size={15}>
        {title}
      </T>
      {children}
    </View>
  );
}

function LangOption({
  label,
  sub,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.langOption,
        { backgroundColor: active ? C.ink : C.white, borderColor: active ? C.ink : C.line },
      ]}
    >
      <T family="bodyBold" size={14} color={active ? C.pop : C.ink}>
        {label}
      </T>
      <T family="body" size={11} color={active ? "#cfe3d6" : C.sage}>
        {sub}
      </T>
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <T family="body" size={13} style={{ minWidth: 34 }}>
        {label}
      </T>
      <T family="bodyMedium" size={13} style={{ flex: 1 }}>
        {value}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  inputWrap: {
    flex: 1,
    height: 48,
    borderRadius: R.md,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 13, color: C.ink, padding: 0 },
  modeChip: {
    alignSelf: "flex-start",
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 4,
  },
  langOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: R.card,
    padding: 14,
    alignItems: "center",
    gap: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
});
