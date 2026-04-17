import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: "#1E88E5",
        tabBarInactiveTintColor: "gray",

        tabBarLabelPosition: "below-icon",

        headerStyle: {
            backgroundColor: "#1E88E5",
            height: 120,
        },

        tabBarStyle: {
            height: 100,
            paddingTop: 12,
            paddingBottom: 12,
        },

        tabBarLabelStyle: {
            fontSize: 12,
            marginTop: 5,
        },

        tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
        },

        headerTintColor: "#FFFFFF",

        headerTitleStyle: {
            fontWeight: "bold",
          },
        }}>
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home" size={25} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Giỏ hàng",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="cart" size={28} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Lịch sử",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="receipt" size={25} color={color}/>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({color, size}) => (
            <Ionicons name="person" size={25} color={color}/>
          )
        }}
      />
    </Tabs>
  );
}