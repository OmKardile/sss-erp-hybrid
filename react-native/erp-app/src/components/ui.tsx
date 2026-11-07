/** ERP shared UI atoms — text, buttons, stat tiles, cards, bars. */

import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { C, R, SP } from "../theme";
import { rupees } from "../lib/format";

type Family = "display" | "body" | "bodyMedium" | "bodyBold";

const FONTS: Record<Family, string> = {
  display: "Unbounded_700Bold",
  body: "SchibstedGrotesk_400Regular",
  bodyMedium: "SchibstedGrotesk_500Medium",
  bodyBold: "SchibstedGrotesk_700Bold",
};

export function font(family: Family): string {
  return FONTS[family];
}

export function T({
  children,
  family = "body",
  size = 15,
  color = C.ink,
  align,
  style,
  numberOfLines,
  adjustsFontSizeToFit,
}: {
  children: React.ReactNode;
  family?: Family;
  size?: number;
  color?: string;
  align?: "left" | "center" | "right";
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      style={[
        {
          fontFamily: FONTS[family],
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

export function Btn({
  title,
  variant = "pop",
  size = "lg",
  loading,
  disabled,
  style,
  ...rest
}: PressableProps & {
  title: string;
  variant?: "pop" | "heat" | "pine" | "ghost" | "mango";
  size?: "md" | "lg";
  loading?: boolean;
}) {
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
  const fg = variant === "pop" || variant === "mango" || variant === "ghost" ? C.ink : C.cream;
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

export function Card({
  children,
  style,
  pine,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pine?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: pine ? C.pine : C.white,
          borderRadius: R.card,
          borderWidth: 2,
          borderColor: C.ink,
          padding: SP.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = "pop",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "pop" | "heat" | "mango" | "white";
}) {
  const bg = tone === "pop" ? C.pop : tone === "heat" ? C.heat : tone === "mango" ? C.mango : C.white;
  const fg = tone === "heat" ? C.cream : C.ink;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg,
        borderRadius: R.card,
        borderWidth: 2,
        borderColor: C.ink,
        padding: 14,
        gap: 2,
      }}
    >
      <T family="bodyMedium" size={11} color={tone === "heat" ? "#ffe1da" : C.sage}>
        {label.toUpperCase()}
      </T>
      <T family="display" size={17} color={fg} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </T>
      {hint ? (
        <T family="body" size={10} color={tone === "heat" ? "#ffe1da" : C.sage}>
          {hint}
        </T>
      ) : null}
    </View>
  );
}

/** Simple horizontal bar list (category breakdown / top products). */
export function BarList({
  items,
  colorFor,
}: {
  items: { label: string; value: number }[];
  colorFor?: (i: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  const palette = [C.heat, C.pop, C.mango, C.pine, C.popDeep, C.sage];
  return (
    <View style={{ gap: 10 }}>
      {items.map((item, i) => (
        <View key={item.label} style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <T family="bodyMedium" size={12} numberOfLines={1} style={{ flex: 1 }}>
              {item.label}
            </T>
            <T family="bodyBold" size={12}>
              {rupees(item.value)}
            </T>
          </View>
          <View
            style={{
              height: 10,
              borderRadius: R.pill,
              backgroundColor: C.cream,
              borderWidth: 1.5,
              borderColor: C.ink,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                width: `${Math.max(3, (item.value / max) * 100)}%`,
                backgroundColor: colorFor ? colorFor(i) : palette[i % palette.length],
              }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

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

/** Round back chevron for stack sub-screens (headers are hidden). */
export function BackBtn({ onPress, label = "Back" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={10}
      style={({ pressed }) => [backStyles.btn, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={{ fontFamily: font("bodyBold"), fontSize: 16, color: C.cream }}>←</Text>
    </Pressable>
  );
}

const backStyles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.pine,
    borderWidth: 2,
    borderColor: C.ink,
    alignItems: "center",
    justifyContent: "center",
  },
});

export function Loader() {
  return (
    <View style={{ padding: SP.xxl, alignItems: "center" }}>
      <ActivityIndicator size="large" color={C.heat} />
    </View>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <View
      style={{
        height: 46,
        borderRadius: R.pill,
        backgroundColor: C.white,
        borderWidth: 2,
        borderColor: C.ink,
        paddingHorizontal: 16,
        justifyContent: "center",
      }}
    >
      <TextInput
        accessibilityLabel={placeholder ?? "Search"}
        placeholder={placeholder ?? "Search…"}
        placeholderTextColor={C.sage}
        value={value}
        onChangeText={onChange}
        style={{ fontSize: 14, color: C.ink, padding: 0, fontFamily: font("body") }}
        returnKeyType="search"
      />
    </View>
  );
}

export const pill = StyleSheet.create({
  base: {
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: "flex-start",
  },
});
