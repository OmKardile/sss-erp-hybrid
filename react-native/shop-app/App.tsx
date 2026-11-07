/**
 * Shubham Super Shopee — customer storefront app (React Native).
 * Fresh Cart candy-pop design, EN/MR one-click language, live/demo data.
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts,
  Unbounded_500Medium,
  Unbounded_700Bold,
  SchibstedGrotesk_400Regular,
  SchibstedGrotesk_500Medium,
  SchibstedGrotesk_700Bold,
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_700Bold,
} from "./src/font-loader";
import { AppProvider } from "./src/state/app";
import { CartProvider } from "./src/state/cart";
import { RootNav } from "./src/nav";

function Shell() {
  return (
    <>
      <StatusBar style="dark" />
      <RootNav />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Unbounded_500Medium,
    Unbounded_700Bold,
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_500Medium,
    SchibstedGrotesk_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
