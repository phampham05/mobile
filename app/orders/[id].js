import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getOrderById } from "../../services/orderService";

export default function OrderDetail() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetail();
  }, []);

  const fetchOrderDetail = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("vi-VN") + " đ";

  const formatDate = (date) =>
    new Date(date).toLocaleString("vi-VN");

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#1E88E5"
        style={{ marginTop: 20 }}
      />
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy đơn hàng</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image
        source={{
          uri:
            item.image ||
            "https://via.placeholder.com/100x150.png?text=No+Image",
        }}
        style={styles.image}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text>Số lượng: {item.quantity}</Text>
        <Text style={styles.price}>
          {formatCurrency(item.price)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.orderId}>
          Mã đơn: {order.orderId}
        </Text>
        <Text>Ngày đặt: {formatDate(order.createdAt)}</Text>
        <Text>Trạng thái: {order.status}</Text>
        <Text>Số điện thoại: {order.phone}</Text>
        <Text>Địa chỉ: {order.address}</Text>
        <Text>Phương thức thanh toán: {order.paymentMethod}</Text>
        <Text>Trạng thái thanh toán: {order.paymentStatus}</Text>
        {order.paidAt && (
          <Text>Thời gian thanh toán: {formatDate(order.paidAt)}</Text>
        )}
        <Text style={styles.total}>
          Tổng tiền: {formatCurrency(order.totalPrice)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Sản phẩm</Text>

      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  summary: {
    backgroundColor: "#FFF",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  orderId: {
    fontWeight: "bold",
    fontSize: 16,
  },
  total: {
    fontWeight: "bold",
    color: "#1E88E5",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
    marginTop: 10,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  image: {
    width: 70,
    height: 100,
    marginRight: 10,
    borderRadius: 5,
  },
  title: {
    fontWeight: "bold",
  },
  price: {
    color: "#1E88E5",
    fontWeight: "bold",
    marginTop: 5,
  },
});