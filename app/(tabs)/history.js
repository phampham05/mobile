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
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import AppTopBar from "../../components/AppTopBar";

import { getOrders } from "../../services/orderService";
import { UserContext } from "../../context/UserContext";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const FALLBACK_IMAGE = "https://via.placeholder.com/100x140.png?text=Book";

function formatCurrency(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function formatOrderDate(date) {
  if (!date) {
    return "Đang cập nhật";
  }

  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getStatusMeta(status) {
  switch (status) {
    case "SHIPPING":
      return {
        label: "Đang giao",
        badgeStyle: styles.statusPrimary,
        actionLabel: "Xem chi tiết",
        actionStyle: styles.primaryAction,
        actionTextStyle: styles.primaryActionText,
      };
    case "COMPLETED":
      return {
        label: "Đã giao",
        badgeStyle: styles.statusNeutral,
        actionLabel: "Mua lại",
        actionStyle: styles.outlineAction,
        actionTextStyle: styles.outlineActionText,
      };
    case "CANCELLED":
      return {
        label: "Đã hủy",
        badgeStyle: styles.statusError,
        actionLabel: "Chi tiết hoàn tiền",
        actionStyle: styles.textAction,
        actionTextStyle: styles.textActionText,
      };
    case "CONFIRMED":
      return {
        label: "Đã xác nhận",
        badgeStyle: styles.statusPrimary,
        actionLabel: "Xem chi tiết",
        actionStyle: styles.primaryAction,
        actionTextStyle: styles.primaryActionText,
      };
    case "PENDING":
    case "PENDING_PAYMENT":
      return {
        label: "Chờ xử lý",
        badgeStyle: styles.statusPending,
        actionLabel: "Xem chi tiết",
        actionStyle: styles.primaryAction,
        actionTextStyle: styles.primaryActionText,
      };
    default:
      return {
        label: status || "Đang xử lý",
        badgeStyle: styles.statusNeutral,
        actionLabel: "Xem chi tiết",
        actionStyle: styles.primaryAction,
        actionTextStyle: styles.primaryActionText,
      };
  }
}

function getOrderItems(order) {
  if (Array.isArray(order?.items) && order.items.length) {
    return order.items;
  }

  return [];
}

export default function History() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchOrders = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError("");

      if (!user) {
        setOrders([]);
        return;
      }

      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setLoadError(getUserFriendlyErrorMessage(error));
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders(true);
    }, [fetchOrders])
  );

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    fetchOrders(true);
  }, [fetchOrders, user]);

  const onRefresh = useCallback(() => {
    if (!user) {
      return;
    }

    setRefreshing(true);
    fetchOrders(false);
  }, [fetchOrders, user]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  const openOrderDetail = useCallback(
    (orderId) => {
      router.push(`/orders/${orderId}`);
    },
    [router]
  );

  const handleAction = useCallback(
    (order) => {
      if (order?.status === "CANCELLED") {
        Alert.alert("Thông báo", "Chi tiết hoàn tiền sẽ hiển thị trong trang đơn hàng.");
      }

      openOrderDetail(order.orderId);
    },
    [openOrderDetail]
  );

  const renderOrderItems = (order) => {
    const items = getOrderItems(order);

    if (!items.length) {
      return (
        <View style={styles.orderPreviewFallback}>
          <Ionicons name="book-outline" size={18} color="#596064" />
          <Text style={styles.orderPreviewFallbackText}>Đơn hàng này chưa có dữ liệu xem trước sản phẩm.</Text>
        </View>
      );
    }

    return items.map((item, index) => {
      const imageUrl = item?.image || FALLBACK_IMAGE;

      return (
        <View key={item?.id ?? `${order.orderId}-${index}`} style={styles.orderItemRow}>
          <View style={[styles.orderItemThumbWrap, order.status === "CANCELLED" && styles.orderItemThumbCancelled]}>
            <Image source={{ uri: imageUrl }} style={styles.orderItemThumb} />
          </View>

          <View style={styles.orderItemInfo}>
            <Text
              style={[styles.orderItemTitle, order.status === "CANCELLED" && styles.orderItemTitleCancelled]}
              numberOfLines={2}
            >
              {item?.title || "Sách"}
            </Text>

            <View style={styles.orderItemMeta}>
              <Text style={styles.orderItemQuantity}>Số lượng: {item?.quantity ?? 1}</Text>
              <Text
                style={[styles.orderItemPrice, order.status === "CANCELLED" && styles.orderItemPriceCancelled]}
              >
                {formatCurrency(item?.price)}
              </Text>
            </View>
          </View>
        </View>
      );
    });
  };

  const renderOrderCard = (order) => {
    const statusMeta = getStatusMeta(order?.status);
    const totalLabel = order?.status === "CANCELLED" ? "Đã hoàn tiền" : "Tổng thanh toán";

    return (
      <View
        key={order.orderId}
        style={[styles.orderCard, order?.status === "CANCELLED" && styles.orderCardCancelled]}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderInfo}>
            <Text style={styles.orderCode}>Mã đơn hàng: #{String(order.orderId || "").slice(0, 8)}</Text>
            <Text style={styles.orderDate}>Đặt ngày {formatOrderDate(order.createdAt)}</Text>
          </View>

          <View style={[styles.statusBadge, statusMeta.badgeStyle]}>
            <Text style={styles.statusText}>{statusMeta.label}</Text>
          </View>
        </View>

        <View style={styles.orderItemsBlock}>{renderOrderItems(order)}</View>

        <View style={[styles.orderFooter, order?.status === "CANCELLED" && styles.orderFooterCancelled]}>
          <View>
            <Text style={styles.orderFooterLabel}>{totalLabel}</Text>
            <Text style={[styles.orderFooterValue, order?.status === "CANCELLED" && styles.orderFooterValueCancelled]}>
              {formatCurrency(order?.totalPrice)}
            </Text>
          </View>

          <Pressable style={statusMeta.actionStyle} onPress={() => handleAction(order)}>
            <Text style={statusMeta.actionTextStyle}>{statusMeta.actionLabel}</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.noticeContainer}>
        <Ionicons name="person-circle-outline" size={72} color="#9CA3AF" />
        <Text style={styles.noticeTitle}>Vui lòng đăng nhập</Text>
        <Text style={styles.noticeText}>Bạn cần đăng nhập để xem lịch sử đơn hàng của mình.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CC1" />
        <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
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
        <View style={styles.headingBlock}>
          <Text style={styles.pageTitle}>Lịch sử đơn hàng</Text>
          <Text style={styles.pageSubtitle}>Theo dõi và quản lý {totalOrders} đơn hàng của bạn</Text>
        </View>

        {loadError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#6E0A12" />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : null}

        {orders.length ? (
          <View style={styles.orderList}>{orders.map(renderOrderCard)}</View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={54} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Bạn chưa có đơn hàng nào</Text>
            <Text style={styles.emptyText}>Khi hoàn tất mua sách, lịch sử đơn hàng sẽ hiển thị tại đây.</Text>
          </View>
        )}
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
    paddingBottom: 120,
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headingBlock: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3437",
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
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
  orderList: {
    gap: 18,
  },
  orderCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#FFFFFF",
    shadowColor: "#2C3437",
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  orderCardCancelled: {
    opacity: 0.84,
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  orderHeaderInfo: {
    flex: 1,
  },
  orderCode: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#596064",
  },
  orderDate: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
    color: "#2C3437",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusPrimary: {
    backgroundColor: "rgba(0,122,253,0.1)",
  },
  statusPending: {
    backgroundColor: "rgba(251,191,36,0.16)",
  },
  statusNeutral: {
    backgroundColor: "#EAEFF2",
  },
  statusError: {
    backgroundColor: "rgba(250,116,111,0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#005CC1",
  },
  orderItemsBlock: {
    gap: 14,
    marginBottom: 16,
  },
  orderItemRow: {
    flexDirection: "row",
    gap: 14,
  },
  orderItemThumbWrap: {
    width: 64,
    height: 84,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#EAEFF2",
  },
  orderItemThumbCancelled: {
    opacity: 0.7,
  },
  orderItemThumb: {
    width: "100%",
    height: "100%",
  },
  orderItemInfo: {
    flex: 1,
    justifyContent: "center",
  },
  orderItemTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2C3437",
  },
  orderItemTitleCancelled: {
    color: "#596064",
  },
  orderItemMeta: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  orderItemQuantity: {
    fontSize: 12,
    color: "#596064",
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005CC1",
  },
  orderItemPriceCancelled: {
    color: "#596064",
    textDecorationLine: "line-through",
  },
  orderPreviewFallback: {
    borderRadius: 14,
    backgroundColor: "#F0F4F7",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  orderPreviewFallbackText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#596064",
  },
  orderFooter: {
    borderRadius: 14,
    backgroundColor: "#F0F4F7",
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  orderFooterCancelled: {
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderTopColor: "rgba(172,179,183,0.18)",
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  orderFooterLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#596064",
  },
  orderFooterValue: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "800",
    color: "#2C3437",
  },
  orderFooterValueCancelled: {
    fontSize: 17,
    color: "#596064",
  },
  primaryAction: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: "#005CC1",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F9F8FF",
  },
  outlineAction: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#005CC1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  outlineActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  textAction: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  textActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  emptyState: {
    marginTop: 36,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "800",
    color: "#2C3437",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#596064",
  },
});
