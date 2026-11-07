/** ERP navigation — login gate, then 5 bottom tabs. */

import React, { createContext, useContext, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "./theme";
import { useErp } from "./state/erp";
import { font } from "./components/ui";
import { LoginScreen } from "./screens/LoginScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { PosScreen } from "./screens/PosScreen";
import { ProductsScreen } from "./screens/ProductsScreen";
import { UdharScreen } from "./screens/UdharScreen";
import { CustomersScreen } from "./screens/CustomersScreen";
import { ReportsScreen } from "./screens/ReportsScreen";
import { MoreScreen } from "./screens/MoreScreen";
import { SettingsScreen } from "./screens/SettingsScreen";

export type MoreStackParams = {
  More: undefined;
  Customers: undefined;
  Reports: undefined;
  ErpSettings: undefined;
};

const MoreStack = createNativeStackNavigator<MoreStackParams>();
const Tab = createBottomTabNavigator();

/** Session reset — lets any screen (e.g. Settings) send the app back to the login gate. */
const SessionCtx = createContext<{ reset: () => void }>({ reset: () => {} });
export const useSession = () => useContext(SessionCtx);

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: C.cream, primary: C.heat },
};

function MoreStackScreen() {
  return (
    <MoreStack.Navigator screenOptions={{ headerShown: false }}>
      <MoreStack.Screen name="More" component={MoreScreenWrapper} />
      <MoreStack.Screen
        name="Customers"
        component={CustomersScreen}
        options={{ animation: "slide_from_right" }}
      />
      <MoreStack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ animation: "slide_from_right" }}
      />
      <MoreStack.Screen
        name="ErpSettings"
        component={SettingsScreen}
        options={{ animation: "slide_from_right" }}
      />
    </MoreStack.Navigator>
  );
}

function TabLabel({ text, focused }: { text: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: font("bodyBold"),
        fontSize: 11,
        color: focused ? C.pop : "#7d8f7a",
      }}
    >
      {text}
    </Text>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, opacity: color === "#7d8f7a" ? 0.6 : 1 }}>{icon}</Text>
    </View>
  );
}

function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: (insets.bottom || 0) + 8,
          height: 64,
          borderRadius: 32,
          backgroundColor: C.pine,
          borderTopWidth: 2,
          borderTopColor: C.ink,
          borderLeftWidth: 2,
          borderLeftColor: C.ink,
          borderRightWidth: 2,
          borderRightColor: C.ink,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: C.pop,
        tabBarInactiveTintColor: "#7d8f7a",
        tabBarLabelPosition: "below-icon",
      }}
    >
      <Tab.Screen
        name="DashTab"
        component={DashboardScreenWrapper}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📊" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text="Dash" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PosTab"
        component={PosScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🧾" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text="POS" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text="Stock" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="UdharTab"
        component={UdharScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📖" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text="Udhar" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text="More" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

/** Wires the More hub's navigation shortcuts. */
function MoreScreenWrapper({ navigation }: any) {
  return (
    <MoreScreen
      onCustomers={() => navigation.navigate("Customers")}
      onReports={() => navigation.navigate("Reports")}
      onSettings={() => navigation.navigate("ErpSettings")}
    />
  );
}

/** Wires the dashboard's "open udhar" shortcut onto the tab navigator. */
function DashboardScreenWrapper({ navigation }: any) {
  return (
    <DashboardScreen
      onOpenUdhar={() => navigation.navigate("UdharTab")}
    />
  );
}

export function RootNav() {
  const { live } = useErp();
  const [sessionOpen, setSessionOpen] = useState(false);
  const authed = live || sessionOpen;

  return (
    <SessionCtx.Provider value={{ reset: () => setSessionOpen(false) }}>
      <NavigationContainer theme={navTheme}>
        {authed ? <Tabs /> : <LoginScreen onLoggedIn={() => setSessionOpen(true)} />}
      </NavigationContainer>
    </SessionCtx.Provider>
  );
}
