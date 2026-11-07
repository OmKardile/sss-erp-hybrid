/**
 * SSS ERP — admin companion app (React Native).
 * Dashboard · POS · Inventory · Udhar · Customers · Reports.
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
} from "./src/font-loader";
import { ErpProvider } from "./src/state/erp";
import { RootNav } from "./src/nav";

export default function App() {
  const [fontsLoaded] = useFonts({
    Unbounded_500Medium,
    Unbounded_700Bold,
    SchibstedGrotesk_400Regular,
    SchibstedGrotesk_500Medium,
    SchibstedGrotesk_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErpProvider>
        <StatusBar style="dark" />
        <RootNav />
      </ErpProvider>
    </SafeAreaProvider>
  );
}
