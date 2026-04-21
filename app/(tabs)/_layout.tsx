import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TabBarIconProps = {
  focused: boolean;
  color: string;
  iconName: ComponentProps<typeof Ionicons>["name"];
  label: string;
};

function TabBarIcon({ focused, color, iconName, label }: TabBarIconProps) {
  return (
    <View style={[styles.tabContent, focused && styles.tabContentActive]}>
      <Ionicons name={iconName} size={22} color={color} />
      <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#005CC1",
        tabBarInactiveTintColor: "#94A3B8",
        sceneStyle: styles.scene,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} iconName="home" label="Trang chủ" />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Khám phá",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} iconName="compass-outline" label="Khám phá" />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} iconName="cart-outline" label="Giỏ hàng" />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch sử",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} iconName="time-outline" label="Lịch sử" />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon focused={focused} color={color} iconName="person-outline" label="Hồ sơ" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: "#F7F9FB",
  },
  tabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 88,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOpacity: 0.03,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 16,
  },
  tabBarItem: {
    marginHorizontal: 1,
  },
  tabContent: {
    minWidth: 58,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContentActive: {
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "500",
  },
});
