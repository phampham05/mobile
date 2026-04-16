import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { useRouter } from "expo-router";
import { UserContext } from "../../context/UserContext";

export default function Profile() {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.loginText}>Bạn chưa đăng nhập</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = (icon, label, value, onPress = null) => (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={22} color="#1E88E5" />
        <Text style={styles.itemLabel}>{label}</Text>
      </View>
      <Text style={styles.itemValue}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        {renderItem("call-outline", "Số điện thoại", user.phone)}
        {renderItem("location-outline", "Địa chỉ", user.address)}
      </View>

      <View style={styles.card}>
        {renderItem("create-outline", "Chỉnh sửa hồ sơ", "", () =>
          router.push("/profile/edit")
        )}
        {renderItem("lock-closed-outline", "Đổi mật khẩu", "", () =>
          router.push("/profile/change-password")
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  loginText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#4C5663",
  },
  loginButton: {
    backgroundColor: "#1E88E5",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerButton: {
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  registerButtonText: {
    color: "#1E88E5",
    fontWeight: "bold",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#1E88E5",
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: "gray",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ddd",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  itemLabel: {
    fontSize: 15,
  },
  itemValue: {
    fontSize: 14,
    color: "gray",
    flex: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
