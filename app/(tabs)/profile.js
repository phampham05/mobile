import { useContext } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { UserContext } from "../../context/UserContext";

function InfoRow({ icon, label, value, onPress }) {
  const content = (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIconWrap}>
          <Ionicons name={icon} size={18} color="#1149D8" />
        </View>
        <View style={styles.infoTextWrap}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={styles.infoValue}>{value || "Chưa cập nhật"}</Text>
        </View>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color="#94A3B8" /> : null}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function Profile() {
  const { user, loading, logout } = useContext(UserContext);
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1149D8" />
        <Text style={styles.loadingText}>Đang tải thông tin hồ sơ...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="person-circle-outline" size={78} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptyText}>
          Đăng nhập để xem và quản lý thông tin tài khoản của bạn.
        </Text>

        <Pressable style={styles.primaryButton} onPress={() => router.push("/login")}>
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.push("/register")}>
          <Text style={styles.secondaryButtonText}>Tạo tài khoản</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name || "Người dùng"}</Text>
        <Text style={styles.email}>{user.email || "Chưa có email"}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <InfoRow icon="mail-outline" label="Email" value={user.email} />
        <InfoRow icon="call-outline" label="Số điện thoại" value={user.phone} />
        <InfoRow icon="location-outline" label="Địa chỉ" value={user.address} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <InfoRow
          icon="create-outline"
          label="Chỉnh sửa hồ sơ"
          value="Cập nhật tên, số điện thoại, địa chỉ"
          onPress={() => router.push("/profile/edit")}
        />
        <InfoRow
          icon="lock-closed-outline"
          label="Đổi mật khẩu"
          value="Thay đổi mật khẩu đăng nhập"
          onPress={() => router.push("/profile/change-password")}
        />
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FB",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: "#F7F8FB",
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: "#171B23",
  },
  emptyText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    color: "#6B7280",
  },
  primaryButton: {
    marginTop: 24,
    minWidth: 180,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#1149D8",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 12,
    minWidth: 180,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: "#E8ECF3",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#1149D8",
    fontSize: 16,
    fontWeight: "800",
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 18,
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: "#1149D8",
    backgroundColor: "#E5E7EB",
  },
  name: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: "800",
    color: "#171B23",
  },
  email: {
    marginTop: 6,
    fontSize: 15,
    color: "#6B7280",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171B23",
    marginBottom: 10,
  },
  infoRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
  },
  infoLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  infoValue: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: "#171B23",
    fontWeight: "600",
  },
  logoutButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
