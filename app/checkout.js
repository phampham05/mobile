import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AppTopBar from "../components/AppTopBar";

const ORDER_ITEMS = [
  {
    id: "1",
    title: "The Art of Curation",
    author: "Elena Wood",
    quantity: 1,
    price: 245000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAAzjcLJTtlB-cruc_nYDstgW7ChyEzw_swSKGCQl_aJjKQXmwUs7JCOLfp6v0MlayW7KO6J5izPRM2WKbUzmyZaBKhcdb8jJSFTW7ogyDUbl7aRc5MjgKXJM-TjyiAhchWV4HfK8WRejDNZM48-Bvc9x5rqNJwa_rn62yt20WoN_8kjQqJLqEiEwsKH7nLUpwH8UCBMOyb8l_lTLkErzs3LEgoWmHVRy80_irjfm6UJfXHrbl8vyRqRWE2qlsNicuby6BtvgZMjw",
  },
  {
    id: "2",
    title: "Thiền Và Nghệ Thuật",
    author: "Minh Tâm",
    quantity: 1,
    price: 189000,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK4X-U0kcxfjge-YY83tlxQC5u8ZJY_IJDcnZZv1uoh0kNJbhJADvYCpSGqz5XFbLHEYsWbcPNdJZBtgh7LoizQRD2hlsoMNAbbU5OP3EENQvB0jeexnC5O0iiePT8rWQC4sj6IgXvRSoQVO5CXETJhNDH72y4OH4aHOkQZz3c1moQLB6BV1IpSz2Jd0iW2Ujb3p6MLXJyVL3eIge0MOiC5kQ84u2TuRCUdzY50Flvk9uXcsJ4wHkA_YXGRQXV1NJOVKjBuO4aYg",
  },
];

const PAYMENT_METHODS = [
  {
    key: "card",
    label: "Thẻ tín dụng / Ghi nợ",
    subtitle: "**** **** **** 8899",
    icon: "card-outline",
  },
  {
    key: "wallet",
    label: "Ví điện tử (Momo/ZaloPay)",
    subtitle: "",
    icon: "wallet-outline",
  },
  {
    key: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    subtitle: "",
    icon: "car-outline",
  },
];

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function Checkout() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState("card");

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/cart");
  };

  const subtotal = useMemo(
    () => ORDER_ITEMS.reduce((sum, item) => sum + item.price * item.quantity, 0),
    []
  );
  const shippingFee = 15000;
  const discount = 20000;
  const total = subtotal + shippingFee - discount;

  return (
    <View style={styles.screen}>
      <AppTopBar leftIcon="arrow-back" onLeftPress={handleGoBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.main}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
              <Pressable>
                <Text style={styles.sectionLink}>Thay đổi</Text>
              </Pressable>
            </View>

            <View style={styles.addressCard}>
              <View style={styles.addressIconWrap}>
                <Ionicons name="home" size={20} color="#005CC1" />
              </View>

              <View style={styles.addressContent}>
                <View style={styles.addressTitleRow}>
                  <Text style={styles.addressLabel}>Nhà riêng</Text>
                  <Text style={styles.defaultBadge}>Mặc định</Text>
                </View>

                <Text style={styles.addressName}>Nguyễn Minh Anh • 090 123 4567</Text>
                <Text style={styles.addressText}>
                  123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>

            <View style={styles.orderGroup}>
              {ORDER_ITEMS.map((item) => (
                <View key={item.id} style={styles.orderCard}>
                  <Image source={{ uri: item.image }} style={styles.orderImage} />

                  <View style={styles.orderInfo}>
                    <View>
                      <Text style={styles.orderTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.orderAuthor}>Tác giả: {item.author}</Text>
                    </View>

                    <View style={styles.orderFooter}>
                      <Text style={styles.orderQuantity}>Số lượng: {String(item.quantity).padStart(2, "0")}</Text>
                      <Text style={styles.orderPrice}>{formatCurrency(item.price)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

            <View style={styles.methodList}>
              {PAYMENT_METHODS.map((method) => {
                const selected = method.key === selectedMethod;

                return (
                  <Pressable
                    key={method.key}
                    style={[styles.methodCard, selected ? styles.methodCardSelected : styles.methodCardIdle]}
                    onPress={() => setSelectedMethod(method.key)}
                  >
                    <View style={styles.methodLeft}>
                      <View style={[styles.methodIconWrap, selected && styles.methodIconWrapSelected]}>
                        <Ionicons name={method.icon} size={20} color={selected ? "#005CC1" : "#596064"} />
                      </View>

                      <View style={styles.methodTextWrap}>
                        <Text style={styles.methodLabel}>{method.label}</Text>
                        {method.subtitle ? <Text style={styles.methodSubtitle}>{method.subtitle}</Text> : null}
                      </View>
                    </View>

                    <View style={[styles.radioOuter, selected ? styles.radioOuterSelected : styles.radioOuterIdle]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.summaryValue}>{formatCurrency(shippingFee)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Giảm giá</Text>
              <Text style={styles.discountValue}>-{formatCurrency(discount)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>

          <View style={styles.checkoutWrap}>
            <Pressable style={styles.checkoutButton}>
              <Text style={styles.checkoutButtonText}>Đặt hàng</Text>
              <Ionicons name="chevron-forward" size={18} color="#F9F8FF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  content: {
    paddingBottom: 48,
  },
  main: {
    paddingTop: 24,
    paddingHorizontal: 24,
    gap: 28,
  },
  section: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#2C3437",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005CC1",
  },
  addressCard: {
    flexDirection: "row",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(172,179,183,0.15)",
  },
  addressIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,122,253,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  addressContent: {
    flex: 1,
    gap: 6,
  },
  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C3437",
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#DBE2F9",
    color: "#4A5264",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3437",
  },
  addressText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#596064",
  },
  orderGroup: {
    padding: 8,
    borderRadius: 22,
    backgroundColor: "#F0F4F7",
    gap: 10,
  },
  orderCard: {
    flexDirection: "row",
    gap: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },
  orderImage: {
    width: 80,
    height: 112,
    borderRadius: 12,
    backgroundColor: "#E3E9ED",
  },
  orderInfo: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C3437",
  },
  orderAuthor: {
    marginTop: 4,
    fontSize: 14,
    color: "#596064",
  },
  orderFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  orderQuantity: {
    fontSize: 12,
    fontWeight: "500",
    color: "#596064",
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#005CC1",
  },
  methodList: {
    gap: 12,
  },
  methodCard: {
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  methodCardSelected: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#005CC1",
  },
  methodCardIdle: {
    backgroundColor: "#F0F4F7",
    borderWidth: 1,
    borderColor: "transparent",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    flex: 1,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#D4DBDF",
    alignItems: "center",
    justifyContent: "center",
  },
  methodIconWrapSelected: {
    backgroundColor: "rgba(0,92,193,0.1)",
  },
  methodTextWrap: {
    flex: 1,
  },
  methodLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2C3437",
  },
  methodSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: "#596064",
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderWidth: 2,
    borderColor: "#005CC1",
  },
  radioOuterIdle: {
    borderWidth: 2,
    borderColor: "#ACB3B7",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#005CC1",
  },
  summaryCard: {
    borderRadius: 22,
    backgroundColor: "rgba(227,233,237,0.5)",
    padding: 20,
    gap: 14,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryLabel: {
    fontSize: 15,
    color: "#596064",
  },
  summaryValue: {
    fontSize: 15,
    color: "#2C3437",
  },
  discountValue: {
    fontSize: 15,
    color: "#A83836",
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(172,179,183,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2C3437",
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#005CC1",
  },
  checkoutWrap: {
    paddingTop: 4,
    paddingBottom: 12,
  },
  checkoutButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#005CC1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#005CC1",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F9F8FF",
  },
});
