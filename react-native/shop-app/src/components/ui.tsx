/** Shared UI atoms — buttons, chips, price stickers, empty states. */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { C, R, SP } from "../theme";
import { rupees } from "../lib/format";
import { useApp } from "../state/app";

/* ---------- font helpers ---------- */

type Family = "display" | "body" | "bodyMedium" | "bodyBold";

const LATIN_FONTS: Record<Family, string> = {
  display: "Unbounded_700Bold",
  body: "SchibstedGrotesk_400Regular",
  bodyMedium: "SchibstedGrotesk_500Medium",
  bodyBold: "SchibstedGrotesk_700Bold",
};

/** Marathi mapping — Unbounded/Schibsted carry no Devanagari glyphs. */
const DEVA_FONTS: Record<Family, string> = {
  display: "NotoSansDevanagari_700Bold",
  body: "NotoSansDevanagari_400Regular",
  bodyMedium: "NotoSansDevanagari_500Medium",
  bodyBold: "NotoSansDevanagari_700Bold",
};

/** Resolve a family for a locale (pure — no globals, render-safe). */
export function font(family: Family, isMr = false): string {
  return isMr ? DEVA_FONTS[family] : LATIN_FONTS[family];
}

/* ---------- text ---------- */

export function T({
  children,
  family = "body",
  size = 15,
  color = C.ink,
  align,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  family?: Family;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const { isMr } = useApp();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontFamily: font(family, isMr),
          fontSize: size,
          color,
          textAlign: align,
          lineHeight: Math.round(size * 1.35),
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

/* ---------- buttons ---------- */

interface BtnProps extends PressableProps {
  title: string;
  variant?: "pop" | "heat" | "pine" | "ghost" | "mango";
  size?: "md" | "lg";
  loading?: boolean;
}

export function Btn({
  title,
  variant = "pop",
  size = "lg",
  loading,
  disabled,
  style,
  ...rest
}: BtnProps) {
  const bg =
    variant === "pop"
      ? C.pop
      : variant === "heat"
        ? C.heat
        : variant === "mango"
          ? C.mango
          : variant === "ghost"
            ? "transparent"
            : C.pine;
  const fg =
    variant === "pop" || variant === "mango" || variant === "ghost"
      ? C.ink
      : C.cream;
  const height = size === "lg" ? 52 : 42;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height,
          borderRadius: R.pill,
          backgroundColor: bg,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 20,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1,
          borderWidth: variant === "ghost" ? 2 : 0,
          borderColor: C.ink,
        },
        style as ViewStyle,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <T family={size === "lg" ? "bodyBold" : "bodyMedium"} size={size === "lg" ? 16 : 14} color={fg}>
          {title}
        </T>
      )}
    </Pressable>
  );
}

/* ---------- price sticker ---------- */

export function Price({
  price,
  compareAt,
  size = 16,
  color = C.ink,
}: {
  price: number;
  compareAt?: number | null;
  size?: number;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
      <T family="bodyBold" size={size} color={color}>
        {rupees(price)}
      </T>
      {compareAt != null && compareAt > price ? (
        <T family="body" size={Math.max(11, size - 4)} color={C.sage} style={{ textDecorationLine: "line-through" }}>
          {rupees(compareAt)}
        </T>
      ) : null}
    </View>
  );
}

/* ---------- chip ---------- */

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        height: 38,
        borderRadius: R.pill,
        backgroundColor: active ? C.ink : C.white,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: active ? C.ink : C.line,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <T family="bodyMedium" size={13} color={active ? C.pop : C.ink}>
        {label}
      </T>
    </Pressable>
  );
}

/* ---------- section header ---------- */

export function SectionHeader({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <View style={{ paddingHorizontal: SP.lg, marginBottom: SP.md, gap: 2 }}>
      {kicker ? (
        <T family="bodyMedium" size={12} color={C.heat}>
          {kicker.toUpperCase()}
        </T>
      ) : null}
      <T family="display" size={22} color={C.ink}>
        {title}
      </T>
    </View>
  );
}

/* ---------- empty / loading ---------- */

export function EmptyState({
  emoji,
  title,
  sub,
}: {
  emoji: string;
  title: string;
  sub?: string;
}) {
  return (
    <View style={{ alignItems: "center", padding: SP.xxl, gap: SP.sm }}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <T family="display" size={18} align="center">
        {title}
      </T>
      {sub ? (
        <T family="body" size={14} color={C.sage} align="center">
          {sub}
        </T>
      ) : null}
    </View>
  );
}

export function GridLoader() {
  return (
    <View style={{ padding: SP.xxl, alignItems: "center" }}>
      <ActivityIndicator size="large" color={C.heat} />
    </View>
  );
}

/* ---------- qty stepper ---------- */

export function QtyStepper({
  qty,
  onChange,
  min = 0,
  compact,
}: {
  qty: number;
  onChange: (q: number) => void;
  min?: number;
  compact?: boolean;
}) {
  const btn = {
    width: compact ? 30 : 36,
    height: compact ? 30 : 36,
    borderRadius: R.pill,
    backgroundColor: qty === 0 ? C.pop : C.ink,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  };
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: compact ? 8 : 12,
      }}
    >
      <Pressable
        accessibilityLabel="Decrease quantity"
        hitSlop={8}
        style={({ pressed }) => [btn, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => onChange(Math.max(min, qty - 1))}
      >
        <T size={compact ? 16 : 18} family="bodyBold" color={qty === 0 ? C.ink : C.pop}>
          −
        </T>
      </Pressable>
      <T family="bodyBold" size={compact ? 14 : 16} style={{ minWidth: compact ? 16 : 22, textAlign: "center" }}>
        {qty}
      </T>
      <Pressable
        accessibilityLabel="Increase quantity"
        hitSlop={8}
        style={({ pressed }) => [btn, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => onChange(Math.min(99, qty + 1))}
      >
        <T size={compact ? 16 : 18} family="bodyBold" color={qty === 0 ? C.ink : C.pop}>
          +
        </T>
      </Pressable>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.cream },
  content: { paddingBottom: 32 },
});
