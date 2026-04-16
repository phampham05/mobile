import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function BookDetailDisabled() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Ionicons name="book-outline" size={64} color="#1149D8" />
        <Text style={styles.title}>Chi tiết sách tạm đóng</Text>
        <Text style={styles.description}>
          Tính năng xem chi tiết sách đang được tạm ẩn. Vui lòng quay lại sau.
        </Text>

        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 28,
    alignItems: "center",
  },
  title: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
    color: "#171B23",
    textAlign: "center",
  },
  description: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
    textAlign: "center",
  },
  button: {
    marginTop: 24,
    minWidth: 140,
    borderRadius: 14,
    backgroundColor: "#1149D8",
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
