/** Product card — photo, name, unit, price sticker, add/qty control. */

import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import type { ProductListItem } from "../lib/types";
import { C, R, SP } from "../theme";
import { useApp } from "../state/app";
import { useCart } from "../state/cart";
import { demoImageFor } from "../lib/demo";
import { Price, QtyStepper, T } from "./ui";
import { discountPct } from "../lib/coupons";

export function productImageSource(image: string | null, slug: string, apiBase: string) {
  if (image && image.startsWith("demo://")) {
    const local = demoImageFor(slug);
    if (local) return local;
  }
  if (image && /^https?:\/\//.test(image)) return { uri: image };
  if (image && image.startsWith("/") && /^https?:\/\//.test(apiBase)) {
    return { uri: `${apiBase.replace(/\/+$/, "")}${image}` };
  }
  return null;
}

export function ProductCard({
  product,
  onPress,
}: {
  product: ProductListItem;
  onPress: () => void;
}) {
  const { name, cat, apiBase } = useApp();
  const cart = useCart();
  const qty = cart.qtyOf(product.id);
  const pct = discountPct(product);
  const img = productImageSource(product.image, product.slug, apiBase);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name(product.name)}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.9 : 1 }]}
    >
      <View style={styles.photoWrap}>
        {img ? (
          <Image source={img} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <T family="display" size={22} color={C.pine}>
              {name(product.name).slice(0, 1)}
            </T>
          </View>
        )}
        {pct > 0 ? (
          <View style={styles.pctBadge}>
            <T family="bodyBold" size={11} color={C.ink}>
              {pct}% OFF
            </T>
          </View>
        ) : null}
        {product.stock <= 0 ? (
          <View style={styles.oops}>
            <T family="bodyBold" size={11} color={C.cream} align="center">
              OUT OF STOCK
            </T>
          </View>
        ) : null}
      </View>
      <View style={{ padding: SP.md, gap: 4, flex: 1 }}>
        <T family="bodyMedium" size={12} color={C.heat} numberOfLines={1}>
          {product.brand ? name(product.brand) : product.category ? cat(product.category) : ""}
        </T>
        <T family="bodyBold" size={14} numberOfLines={2} style={{ minHeight: 38 }}>
          {name(product.name)}
        </T>
        <T family="body" size={12} color={C.sage}>
          {name(product.unitType)}
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <Price price={product.price} compareAt={product.compareAtPrice} size={16} />
          {product.stock > 0 ? (
            <QtyStepper compact qty={qty} onChange={(q) => (q === 0 && qty > 0 ? cart.setQty(product.id, 0) : cart.setQty(product.id, q))} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const CARD_W = 168;

const styles = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: R.card,
    backgroundColor: C.white,
    borderWidth: 2,
    borderColor: C.ink,
    overflow: "hidden",
    flex: 1,
  },
  photoWrap: { position: "relative" },
  photo: {
    width: "100%",
    height: 124,
    borderTopLeftRadius: R.card - 2,
    borderTopRightRadius: R.card - 2,
  },
  photoFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.pop,
  },
  pctBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: C.mango,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  oops: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.ink,
    paddingVertical: 3,
  },
});
