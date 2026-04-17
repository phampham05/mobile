import React, { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getOrders } from "../../services/orderService";
import { UserContext } from "../../context/UserContext";

export default function History() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (!user) return;
    setRefreshing(true);
    fetchOrders();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDING_PAYMENT":
        return "#FFA500";
      case "CONFIRMED":
        return "#1E88E5";
      case "SHIPPING":
        return "#9C27B0";
      case "COMPLETED":
        return "#4CAF50";
      case "CANCELLED":
        return "#E53935";
      default:
        return "#333";
    }
  };

  const formatCurrency = (amount) => Number(amount).toLocaleString("vi-VN") + " đ";
  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item.orderId}`)}>
      <View style={styles.row}>
        <Ionicons name="receipt-outline" size={22} color="#1E88E5" />
        <Text style={styles.orderId}>Đơn hàng #{item.orderId.slice(0, 8)}</Text>
      </View>

      <Text style={styles.date}>Ngày đặt: {formatDate(item.createdAt)}</Text>
      <Text style={styles.total}>Tổng tiền: {formatCurrency(item.totalPrice)}</Text>
      <Text style={[styles.status, { color: getStatusColor(item.status) }]}>{item.status}</Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.noticeContainer}>
        <Ionicons name="person-circle-outline" size={72} color="#9CA3AF" />
        <Text style={styles.noticeText}>Vui lòng đăng nhập.</Text>
      </View>
    );
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#1E88E5" style={styles.loading} />;
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="gray" />
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.orderId}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: "#F5F5F5",
  },
  loading: {
    marginTop: 20,
  },
  noticeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 24,
  },
  noticeText: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  card: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  orderId: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  date: {
    color: "gray",
  },
  total: {
    fontWeight: "bold",
    color: "#1E88E5",
    marginVertical: 4,
  },
  status: {
    fontWeight: "bold",
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 60,
  },
  emptyText: {
    marginTop: 10,
    color: "gray",
    fontSize: 16,
  },
});
