/** Product detail — photo, price sticker, perks, description, reviews, buy box. */

import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ShopStackParams } from "../nav";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart } from "../state/cart";
import { Btn, Price, QtyStepper, T } from "../components/ui";
import { productImageSource } from "../components/ProductCard";
import type { ProductDetail } from "../lib/types";
import { demoImageFor } from "../lib/demo";
import { discountPct } from "../lib/coupons";
import { formatDateOnlyFor } from "../lib/i18n";

type Props = NativeStackScreenProps<ShopStackParams, "Product">;

const PERKS = [
  { key: "pd.perk-delivery", icon: "🛵" },
  { key: "pd.perk-quality", icon: "🌱" },
  { key: "pd.perk-returns", icon: "↩️" },
];

export function ProductScreen({ navigation, route }: Props) {
  const { slug } = route.params;
  const { t, name, cat, api, apiBase } = useApp();
  const insets = useSafeAreaInsets();
  const cart = useCart();
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setDetail(null);
    setError(null);
    api
      .productDetail(slug)
      .then((d) => alive && setDetail(d))
      .catch(() => alive && setError(t("home.error-load")));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, api]);

  if (error) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackRow title={route.params.name ?? ""} onBack={() => navigation.goBack()} />
        <View style={{ padding: SP.xl, alignItems: "center", gap: 12 }}>
          <T family="display" size={18}>
            {t("home.error-title")}
          </T>
          <Btn title={t("home.try-again")} variant="heat" onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <BackRow title={route.params.name ?? ""} onBack={() => navigation.goBack()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={C.heat} />
        </View>
      </SafeAreaView>
    );
  }

  const qty = cart.qtyOf(detail.id);
  const pct = discountPct(detail);
  const img = productImageSource(detail.image, detail.slug, apiBase);

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <BackRow title={name(detail.name)} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ paddingBottom: 240 }} showsVerticalScrollIndicator={false}>
        {/* photo */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.sm }}>
          {img ? (
            <Image
              source={img}
              style={styles.photo}
              resizeMode="cover"
              accessibilityLabel={name(detail.name)}
            />
          ) : (
            <View style={[styles.photo, styles.photoFallback]}>
              <T family="display" size={44} color={C.pine}>
                {name(detail.name).slice(0, 1)}
              </T>
            </View>
          )}
          {pct > 0 ? (
            <View style={styles.pctSticker}>
              <T family="bodyBold" size={14} color={C.ink}>
                {pct}% OFF
              </T>
            </View>
          ) : null}
        </View>

        {/* title block */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg, gap: 4 }}>
          {detail.brand ? (
            <T family="bodyMedium" size={13} color={C.heat}>
              {name(detail.brand)}
            </T>
          ) : null}
          <T family="display" size={22} style={{ lineHeight: 30 }}>
            {name(detail.name)}
          </T>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 }}>
            <T family="body" size={13} color={C.sage}>
              {name(detail.unitType)} · {detail.category ? cat(detail.category) : ""}
            </T>
          </View>
          {detail.reviewCount > 0 ? (
            <T family="body" size={13} color={C.sage}>
              ★ {detail.avgRating} ·{" "}
              {t(detail.reviewCount === 1 ? "pd.review-count-one" : "pd.review-count", {
                n: detail.reviewCount,
              })}
            </T>
          ) : null}
        </View>

        {/* price + stock */}
        <View style={styles.priceRow}>
          <Price price={detail.price} compareAt={detail.compareAtPrice} size={26} />
          <View
            style={[
              styles.stockPill,
              { backgroundColor: detail.stock > 5 ? C.pop : detail.stock > 0 ? C.mango : C.ink },
            ]}
          >
            <T family="bodyBold" size={12} color={detail.stock > 0 ? C.ink : C.cream}>
              {detail.stock > 5
                ? t("pd.in-stock")
                : detail.stock > 0
                  ? t("pd.only-left", { n: detail.stock })
                  : t("pd.out-of-stock")}
            </T>
          </View>
        </View>

        {/* perks */}
        <View style={styles.perkRow}>
          {PERKS.map((p) => (
            <View key={p.key} style={styles.perk}>
              <T size={16}>{p.icon}</T>
              <T family="bodyMedium" size={11} align="center" color={C.pine}>
                {t(p.key)}
              </T>
            </View>
          ))}
        </View>

        {/* description */}
        {detail.description ? (
          <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg, gap: 6 }}>
            <T family="bodyBold" size={15}>
              {t("pd.description")}
            </T>
            <T size={14} color={C.sage} style={{ lineHeight: 21 }}>
              {name(detail.description)}
            </T>
          </View>
        ) : null}

        {/* reviews */}
        <View style={{ paddingHorizontal: SP.lg, marginTop: SP.xl, gap: 12 }}>
          <T family="bodyBold" size={15}>
            {t("pd.reviews")}{" "}
            {detail.reviewCount > 0 ? (
              <T size={13} color={C.sage}>
                ({t("pd.based-on", { n: detail.reviewCount })} · {detail.avgRating}★)
              </T>
            ) : null}
          </T>
          {detail.reviews.length === 0 ? (
            <T size={13} color={C.sage}>
              {t("pd.no-reviews")}
            </T>
          ) : (
            detail.reviews.map((r) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <T family="bodyBold" size={13}>
                    {r.customerName}
                  </T>
                  <T family="body" size={12} color={C.mango}>
                    {"★".repeat(r.rating)}
                  </T>
                </View>
                {r.comment ? (
                  <T size={13} color={C.sage} style={{ marginTop: 4, lineHeight: 19 }}>
                    {r.comment}
                  </T>
                ) : null}
                <T size={11} color={C.sage} style={{ marginTop: 4, opacity: 0.7 }}>
                  {formatDateOnlyFor("en", r.createdAt)}
                </T>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* buy box */}
      <View style={styles.buyBox}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <T family="body" size={13} color={C.sage}>
            {t("header.basket")}
          </T>
          <QtyStepper qty={qty} onChange={(q) => cart.setQty(detail.id, q)} />
        </View>
        <Btn
          title={qty > 0 ? t("pd.buy-now") : t("pd.add")}
          variant="heat"
          style={{ flex: 1 }}
          disabled={detail.stock <= 0}
          onPress={() => {
            if (qty === 0) cart.add(detail, 1);
            (navigation as any).navigate("CartTab");
          }}
        />
      </View>
    </SafeAreaView>
  );
}

export function BackRow({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.backRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack}
        hitSlop={10}
        style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <T family="bodyBold" size={16} color={C.cream}>
          ←
        </T>
      </Pressable>
      <T family="bodyBold" size={14} numberOfLines={1} style={{ flex: 1 }}>
        {title}
      </T>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: R.pill,
    backgroundColor: C.pine,
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
  },
  photoFallback: { alignItems: "center", justifyContent: "center", backgroundColor: C.pop },
  pctSticker: {
    position: "absolute",
    right: 14,
    top: 14,
    backgroundColor: C.mango,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    transform: [{ rotate: "4deg" }],
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SP.lg,
    marginTop: SP.lg,
  },
  stockPill: {
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  perkRow: {
    flexDirection: "row",
    gap: SP.md,
    paddingHorizontal: SP.lg,
    marginTop: SP.lg,
  },
  perk: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.md,
    padding: 10,
    alignItems: "center",
    gap: 4,
  },
  reviewCard: {
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.line,
    borderRadius: R.md,
    padding: 12,
  },
  buyBox: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    marginBottom: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.cream,
    borderTopWidth: 2,
    borderTopColor: C.ink,
    paddingHorizontal: SP.lg,
    paddingTop: 12,
    paddingBottom: 18,
  },
});
