// Tab Navigation - Lucide Icon Design
import React from "react";
import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  Home,
  Search,
  ShoppingCart,
  Package,
  User,
} from "lucide-react-native";
import { colors, typography, spacing, borderRadius, shadows } from "@/theme";
import { useCartStore } from "@/store";

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const scale = useSharedValue(focused ? 1.15 : 1);

  const iconColor = focused ? colors.primary : colors.textTertiary;

  const iconEl = (() => {
    switch (name) {
      case "home": return <Home size={22} color={iconColor} />;
      case "search": return <Search size={22} color={iconColor} />;
      case "cart": return <ShoppingCart size={22} color={iconColor} />;
      case "orders": return <Package size={22} color={iconColor} />;
      case "profile": return <User size={22} color={iconColor} />;
      default: return <Home size={22} color={iconColor} />;
    }
  })();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cartCount = name === "cart" ? useCartStore.getState().getItemCount() : 0;

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={[styles.iconContainer, animatedStyle]}>
        {iconEl}
      </Animated.View>
      {focused && (
        <View style={styles.activeIndicator} />
      )}
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: [styles.tabBar, { paddingBottom: insets.bottom > 0 ? spacing.md : spacing.lg }],
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabBarIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => <TabBarIcon name="search" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ focused }) => <TabBarIcon name="cart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ focused }) => <TabBarIcon name="orders" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    height: 80,
  },
  tabLabel: {
    ...typography.small,
    marginTop: 4,
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 32,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -10,
    backgroundColor: colors.accent,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.black,
    fontSize: 10,
    fontWeight: "700",
  },
});
