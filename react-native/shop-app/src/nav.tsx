/** Navigation — bottom tabs (Shop, Cart, Orders, Settings) + in-tab stacks. */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C } from "./theme";
import { useApp } from "./state/app";
import { useCart } from "./state/cart";
import { HomeScreen } from "./screens/HomeScreen";
import { ProductScreen } from "./screens/ProductScreen";
import { CartScreen } from "./screens/CartScreen";
import { CheckoutScreen } from "./screens/CheckoutScreen";
import { OrderConfirmScreen } from "./screens/OrderConfirmScreen";
import { OrdersScreen } from "./screens/OrdersScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { font } from "./components/ui";

export type ShopStackParams = {
  Home: undefined;
  Product: { slug: string; name?: string };
};

export type CartStackParams = {
  Cart: undefined;
  Checkout: undefined;
  OrderConfirm: { order: import("./lib/types").OrderView };
};

export type OrdersStackParams = {
  Orders: undefined;
  OrderConfirm: { order: import("./lib/types").OrderView };
};

export type RootTabs = {
  ShopTab: undefined;
  CartTab: undefined;
  OrdersTab: undefined;
  SettingsTab: undefined;
};

const ShopStack = createNativeStackNavigator<ShopStackParams>();
const CartStack = createNativeStackNavigator<CartStackParams>();
const OrdersStack = createNativeStackNavigator<OrdersStackParams>();
const Tab = createBottomTabNavigator<RootTabs>();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: C.cream, primary: C.heat },
};

function ShopStackScreen() {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false }}>
      <ShopStack.Screen name="Home" component={HomeScreen} />
      <ShopStack.Screen
        name="Product"
        component={ProductScreen}
        options={{ animation: "slide_from_right" }}
      />
    </ShopStack.Navigator>
  );
}

function CartStackScreen() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="Cart" component={CartScreen} />
      <CartStack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: "slide_from_right" }}
      />
      <CartStack.Screen
        name="OrderConfirm"
        component={OrderConfirmScreen}
        options={{ animation: "fade" }}
      />
    </CartStack.Navigator>
  );
}

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
      <OrdersStack.Screen
        name="OrderConfirm"
        component={OrderConfirmScreen}
        options={{ animation: "slide_from_right" }}
      />
    </OrdersStack.Navigator>
  );
}

/** Tab label underlay — needs the locale-aware font, hence a component. */
function TabLabel({ text, focused }: { text: string; focused: boolean }) {
  const { isMr } = useApp();
  return (
    <Text
      style={{
        fontFamily: font("bodyBold", isMr),
        fontSize: 11,
        color: focused ? C.cream : "#7d8f7a",
      }}
    >
      {text}
    </Text>
  );
}

function Tabs() {
  const { t, isMr } = useApp();
  const cart = useCart();
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
        name="ShopTab"
        component={ShopStackScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🏬" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text={t("mnav.home")} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStackScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="🧺" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text={t("mnav.cart")} focused={focused} />,
          tabBarBadgeStyle: {
            backgroundColor: C.heat,
            color: C.cream,
            fontFamily: font("bodyBold", false),
            fontSize: 10,
            minWidth: 18,
            minHeight: 18,
            borderRadius: 9,
          },
          ...(cart.itemCount > 0 ? { tabBarBadge: cart.itemCount as any } : {}),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text={isMr ? "ऑर्डर" : "Orders"} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel text={isMr ? "सेटिंग्ज" : "Settings"} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, opacity: color === "#7d8f7a" ? 0.6 : 1 }}>{icon}</Text>
    </View>
  );
}

export function RootNav() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tabs />
    </NavigationContainer>
  );
}
