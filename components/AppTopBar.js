import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppTopBar({
  title = "BOOKSTORE",
  onLeftPress,
  onRightPress,
  leftIcon = "menu",
  rightIcon = "notifications-outline",
}) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" backgroundColor="#005CC1" />
      <View style={[styles.shell, { paddingTop: insets.top + 10 }]}>
        <View style={styles.row}>
          <Pressable style={styles.iconButton} onPress={onLeftPress}>
            <Ionicons name={leftIcon} size={22} color="#FFFFFF" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>

          <Pressable style={styles.iconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "#005CC1",
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#005CC1",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  row: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2.6,
    color: "#FFFFFF",
  },
});
