/** Home — hero, search, category chips, Deal of the Day, product grid. */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart } from "../state/cart";
import { Btn, Chip, EmptyState, GridLoader, Price, SectionHeader, T, font } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import type { ProductListItem } from "../lib/types";
import { dealOfTheDay, discountPct } from "../lib/coupons";
import { demoImageFor } from "../lib/demo";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ShopStackParams } from "../nav";

type Props = NativeStackScreenProps<ShopStackParams, "Home">;

function msToNextIstMidnight(): number {
  const now = Date.now();
  // IST = UTC+5:30
  const istOffsetMs = 5.5 * 3600000;
  const istNow = new Date(now + istOffsetMs);
  const istEndOfDay = Date.UTC(
    istNow.getUTCFullYear(),
    istNow.getUTCMonth(),
    istNow.getUTCDate() + 1,
  );
  return istEndOfDay - (now + istOffsetMs);
}

function useCountdown(): string {
  const [ms, setMs] = useState(msToNextIstMidnight());
  useEffect(() => {
    const id = setInterval(() => setMs(msToNextIstMidnight()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function HomeScreen({ navigation }: Props) {
  const { t, name, cat, api, learnNames, locale, toggleLocale, isMr } = useApp();
  const cart = useCart();
  const [products, setProducts] = useState<ProductListItem[] | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const gridRef = useRef<FlatList<ProductListItem>>(null);
  const countdown = useCountdown();

  const load = useCallback(
    async (showSpinner = true) => {
      if (showSpinner) setProducts(null);
      setError(null);
      try {
        const data = await api.products();
        setProducts(data.items);
        setCategories(["All", ...data.categories]);
        learnNames([
          ...data.items.map((p) => p.name),
          ...data.items.map((p) => p.brand ?? "").filter(Boolean),
          ...data.categories,
        ]);
      } catch {
        setError(t("home.error-load"));
      }
    },
    [api, t, learnNames],
  );

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  const filtered = useMemo(() => {
    if (!products) return null;
    let list = products;
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, category, query]);

  const deal = useMemo(() => (products ? dealOfTheDay(products) : null), [products]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }, [load]);

  const dealQty = deal ? cart.qtyOf(deal.id) : 0;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {/* search row */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <TextInput
            accessibilityLabel={t("header.search-aria")}
            placeholder={t("header.search-placeholder")}
            placeholderTextColor={C.sage}
            value={query}
            onChangeText={setQuery}
            style={[styles.searchInput, { fontFamily: font("body", isMr) }]}
            returnKeyType="search"
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={locale === "mr" ? t("lang.toggle-aria-mr") : t("lang.toggle-aria-en")}
          onPress={toggleLocale}
          style={({ pressed }) => [styles.langPill, { opacity: pressed ? 0.8 : 1 }]}
        >
          <T family="bodyBold" size={13} color={C.cream}>
            {locale === "mr" ? "EN" : "मराठी"}
          </T>
        </Pressable>
      </View>

      <FlatList
        ref={gridRef}
        data={filtered ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: SP.lg, gap: SP.md }}
        contentContainerStyle={{ paddingBottom: 130 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.heat} />}
        ListHeaderComponent={
          <View>
            {/* hero */}
            <View style={styles.hero}>
              <T family="bodyBold" size={12} color={C.mango}>
                {t("hero.kicker").toUpperCase()}
              </T>
              <View style={{ gap: 2, marginTop: 10 }}>
                <T family="display" size={40} color={C.pop}>
                  {t("hero.line1")}
                </T>
                <T family="display" size={40} color={C.cream}>
                  {t("hero.line2")}
                </T>
                <T family="display" size={24} color={C.mango}>
                  {t("hero.line3a")} {t("hero.line3b")}
                </T>
              </View>
              <T size={13} color="#cfe3d6" style={{ marginTop: 10, lineHeight: 19 }}>
                {t("hero.subline", { name: "Shubham Super Shopee" })}
              </T>
              <View style={{ flexDirection: "row", gap: 10, marginTop: 16, alignItems: "center" }}>
                <Btn
                  title={t("hero.cta-shop")}
                  onPress={() => gridRef.current?.scrollToOffset({ offset: 320, animated: true })}
                />
                <View style={styles.sticker}>
                  <T family="bodyBold" size={11} color={C.ink}>
                    {t("hero.sticker")}
                  </T>
                </View>
              </View>
            </View>

            {/* categories */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: SP.lg, gap: 8, marginTop: SP.lg }}
            >
              {categories.map((c) => (
                <Chip key={c} label={cat(c)} active={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>

            {/* deal of the day */}
            {deal ? (
              <View style={{ marginTop: SP.xl }}>
                <SectionHeader kicker={t("deal.kicker")} title={t("nav.deal")} />
                <View style={styles.dealCard}>
                  <View style={{ flex: 1.1 }}>
                    <T family="bodyBold" size={13} color={C.ink} numberOfLines={2}>
                      {name(deal.name)}
                    </T>
                    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 6 }}>
                      <Price price={deal.price} compareAt={deal.compareAtPrice} size={20} />
                      <T family="bodyBold" size={12} color={C.heat}>
                        {discountPct(deal)}% OFF
                      </T>
                    </View>
                    <View style={styles.countdown}>
                      <T family="bodyMedium" size={12} color={C.ink}>
                        ⏱ {countdown}
                      </T>
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <Btn
                        title={dealQty > 0 ? t("deal.added") : t("deal.add")}
                        size="md"
                        variant="heat"
                        onPress={() => {
                          if (dealQty === 0) cart.add(deal, 1);
                        }}
                      />
                    </View>
                  </View>
                  <ProductCardMini product={deal} onPress={() => navigation.navigate("Product", { slug: deal.slug, name: deal.name })} />
                </View>
              </View>
            ) : null}

            {/* shelf */}
            <View style={{ marginTop: SP.xl }}>
              <SectionHeader
                kicker={t("home.items-in-store", { n: filtered?.length ?? 0 })}
                title={category === "All" ? t("home.shelf-title") : cat(category)}
              />
            </View>

            {error ? (
              <View style={{ padding: SP.xl, gap: 12 }}>
                <EmptyState emoji="🛒" title={t("home.error-title")} sub={error} />
                <Btn title={t("home.try-again")} variant="heat" onPress={() => load()} style={{ alignSelf: "center" }} />
              </View>
            ) : filtered === null ? (
              <GridLoader />
            ) : filtered.length === 0 ? (
              <EmptyState emoji="🔍" title={t("home.empty-title")} sub={t("home.empty-sub")} />
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ flex: 1 / 2, maxWidth: "50%", marginBottom: SP.md }}>
            <ProductCard
              product={item}
              onPress={() => navigation.navigate("Product", { slug: item.slug, name: item.name })}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function ProductCardMini({
  product,
  onPress,
}: {
  product: ProductListItem;
  onPress: () => void;
}) {
  const { apiBase } = useApp();
  const img = product.image;
  const source: any = img?.startsWith("demo://")
    ? demoImageFor(product.slug)
    : img?.startsWith("/")
      ? { uri: `${apiBase.replace(/\/+$/, "")}${img}` }
      : img
        ? { uri: img }
        : null;
  if (!source) return null;
  return (
    <Pressable onPress={onPress} style={{ flex: 1, paddingLeft: 8 }}>
      <Image source={source} style={styles.dealPhoto} resizeMode="cover" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.md,
    alignItems: "center",
  },
  searchWrap: {
    flex: 1,
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  searchInput: { fontSize: 14, color: C.ink, padding: 0 },
  langPill: {
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.pine,
    borderWidth: 2,
    borderColor: C.pop,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    marginHorizontal: SP.lg,
    marginTop: SP.sm,
    backgroundColor: C.pine,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.xl,
  },
  sticker: {
    backgroundColor: C.mango,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    transform: [{ rotate: "-3deg" }],
  },
  dealCard: {
    marginHorizontal: SP.lg,
    backgroundColor: C.pop,
    borderRadius: R.card,
    borderWidth: 2,
    borderColor: C.ink,
    padding: SP.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  countdown: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: C.cream,
    borderWidth: 2,
    borderColor: C.ink,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dealPhoto: {
    width: "100%",
    height: 120,
    borderRadius: R.md,
    borderWidth: 2,
    borderColor: C.ink,
  },
});
