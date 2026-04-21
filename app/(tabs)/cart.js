import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AppTopBar from "../../components/AppTopBar";

import {
  getCartWithBookDetails,
  removeCartItem,
  updateCartItem,
} from "../../services/cartService";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { UserContext } from "../../context/UserContext";

const FALLBACK_IMAGE = "https://via.placeholder.com/120x180.png?text=No+Image";
const VAT_RATE = 0.05;

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function Cart() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchCart = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError("");

      if (!user) {
        setCartItems([]);
        return;
      }

      const data = await getCartWithBookDetails();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(getUserFriendlyErrorMessage(error));
      setCartItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchCart(true);
    }, [fetchCart])
  );

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    fetchCart(true);
  }, [fetchCart, user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart(false);
  }, [fetchCart]);

  const updateQuantity = useCallback(
    async (item, nextQuantity) => {
      if (nextQuantity < 1) {
        return;
      }

      try {
        setUpdatingItemId(item.id);
        await updateCartItem(item.id, nextQuantity);

        setCartItems((prev) =>
          prev.map((cartItem) =>
            cartItem.id === item.id
              ? {
                  ...cartItem,
                  quantity: nextQuantity,
                  total: nextQuantity * cartItem.price,
                }
              : cartItem
          )
        );
      } catch (error) {
        Alert.alert("Không thể cập nhật số lượng", getUserFriendlyErrorMessage(error));
      } finally {
        setUpdatingItemId(null);
      }
    },
    []
  );

  const increaseQuantity = useCallback(
    (item) => {
      updateQuantity(item, item.quantity + 1);
    },
    [updateQuantity]
  );

  const decreaseQuantity = useCallback(
    (item) => {
      if (item.quantity === 1) {
        return;
      }

      updateQuantity(item, item.quantity - 1);
    },
    [updateQuantity]
  );

  const handleRemoveItem = useCallback((id) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setUpdatingItemId(id);
            await removeCartItem(id);
            setCartItems((prev) => prev.filter((item) => item.id !== id));
          } catch (error) {
            Alert.alert("Không thể xóa sản phẩm", getUserFriendlyErrorMessage(error));
          } finally {
            setUpdatingItemId(null);
          }
        },
      },
    ]);
  }, []);

  const handleApplyPromo = useCallback(() => {
    if (!promoCode.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập mã giảm giá.");
      return;
    }

    Alert.alert("Thông báo", "Tính năng áp dụng mã giảm giá đang được cập nhật.");
  }, [promoCode]);

  const handleCheckout = useCallback(() => {
    if (!cartItems.length) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
      return;
    }

    router.push("/checkout");
  }, [cartItems.length, router]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cartItems]
  );
  const vatAmount = useMemo(() => Math.round(subtotal * VAT_RATE), [subtotal]);
  const totalAmount = useMemo(() => subtotal + vatAmount, [subtotal, vatAmount]);
  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const renderCartItem = (item) => {
    const imageUrl = item.book?.image || FALLBACK_IMAGE;
    const isUpdating = updatingItemId === item.id;

    return (
      <View key={item.id} style={styles.cartCard}>
        <Pressable
          style={styles.bookPressable}
          onPress={() =>
            router.push({
              pathname: "/book/[id]",
              params: { id: item.bookId },
            })
          }
        >
          <View style={styles.bookImageFrame}>
            <Image source={{ uri: imageUrl }} style={styles.bookImage} />
          </View>

          <View style={styles.itemInfo}>
            <Text style={styles.bookTitle} numberOfLines={1}>
              {item.book?.title || "Chưa có tên sách"}
            </Text>
            <Text style={styles.bookAuthor} numberOfLines={1}>
              {item.book?.author || "Đang cập nhật"}
            </Text>

            <View style={styles.itemFooter}>
              <View style={styles.quantityWrap}>
                <Pressable style={styles.qtyButton} onPress={() => decreaseQuantity(item)} disabled={isUpdating}>
                  <Ionicons name="remove" size={18} color="#005CC1" />
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable style={styles.qtyButton} onPress={() => increaseQuantity(item)} disabled={isUpdating}>
                  <Ionicons name="add" size={18} color="#005CC1" />
                </Pressable>
              </View>

              <Text style={styles.itemPrice}>{formatCurrency(item.quantity * item.price)}</Text>
            </View>
          </View>
        </Pressable>

        <Pressable style={styles.removeButton} onPress={() => handleRemoveItem(item.id)} disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator size="small" color="#A83836" />
          ) : (
            <Ionicons name="trash-outline" size={18} color="#A83836" />
          )}
        </Pressable>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.noticeContainer}>
        <Ionicons name="person-circle-outline" size={72} color="#9CA3AF" />
        <Text style={styles.noticeTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.noticeText}>Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CC1" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005CC1" />}
    >
      <AppTopBar />

      <View style={styles.main}>
        <View style={styles.itemsSection}>
          <View style={styles.headingBlock}>
            <Text style={styles.pageTitle}>Giỏ hàng</Text>
            <Text style={styles.pageSubtitle}>Bạn có {totalQuantity} quyển sách trong giỏ</Text>
          </View>

          {loadError ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#6E0A12" />
              <Text style={styles.errorText}>{loadError}</Text>
            </View>
          ) : null}

          {cartItems.length ? (
            <View style={styles.cartList}>{cartItems.map(renderCartItem)}</View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
              <Text style={styles.emptyText}>Hãy thêm một vài cuốn sách bạn yêu thích.</Text>
            </View>
          )}
        </View>

        <View style={styles.summarySection}>
          <View style={styles.promoCard}>
            <Text style={styles.promoLabel}>Mã giảm giá</Text>
            <View style={styles.promoRow}>
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Nhập mã tại đây..."
                placeholderTextColor="#596064"
                style={styles.promoInput}
              />
              <Pressable style={styles.applyButton} onPress={handleApplyPromo}>
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
              <Text style={styles.shippingValue}>Miễn phí</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Thuế (VAT)</Text>
              <Text style={styles.summaryValue}>{formatCurrency(vatAmount)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng cộng</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
            </View>
          </View>

          <Pressable style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
            <Ionicons name="arrow-forward" size={18} color="#F9F8FF" />
          </Pressable>

          <View style={styles.secureRow}>
            <Ionicons name="lock-closed" size={14} color="#596064" />
            <Text style={styles.secureText}>Thanh toán an toàn & bảo mật</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  content: {
    paddingBottom: 128,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F9FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#596064",
  },
  noticeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F9FB",
    paddingHorizontal: 28,
  },
  noticeTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#2C3437",
  },
  noticeText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#596064",
  },
  main: {
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  itemsSection: {
    flex: 1,
  },
  headingBlock: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2C3437",
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#596064",
  },
  errorBanner: {
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FA746F",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFF7F6",
  },
  cartList: {
    gap: 16,
  },
  cartCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 18,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },
  bookPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bookImageFrame: {
    width: 80,
    height: 112,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#E3E9ED",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3437",
  },
  bookAuthor: {
    marginTop: 4,
    marginBottom: 12,
    fontSize: 14,
    color: "#596064",
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  quantityWrap: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    borderRadius: 999,
    backgroundColor: "#EAEFF2",
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    minWidth: 34,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3437",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#005CC1",
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: 22,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3437",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#596064",
  },
  summarySection: {
    marginTop: 28,
    gap: 16,
  },
  promoCard: {
    borderRadius: 24,
    backgroundColor: "#F0F4F7",
    padding: 18,
  },
  promoLabel: {
    marginBottom: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3437",
  },
  promoRow: {
    flexDirection: "row",
    gap: 10,
  },
  promoInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#E3E9ED",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#2C3437",
  },
  applyButton: {
    minWidth: 94,
    borderRadius: 12,
    backgroundColor: "#005CC1",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F9F8FF",
  },
  summaryCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(172,179,183,0.18)",
    gap: 16,
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
    fontWeight: "700",
    color: "#2C3437",
  },
  shippingValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#16A34A",
  },
  totalRow: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(172,179,183,0.3)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2C3437",
  },
  totalValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#005CC1",
  },
  checkoutButton: {
    minHeight: 56,
    borderRadius: 18,
    backgroundColor: "#005CC1",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    opacity: 0.7,
  },
  secureText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#596064",
  },
});
