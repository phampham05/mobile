import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getCartWithBookDetails,
  removeCartItem,
  updateCartItem,
} from "../../services/cartService";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";
import { UserContext } from "../../context/UserContext";

const FALLBACK_IMAGE = "https://via.placeholder.com/100x150.png?text=No+Image";

export default function Cart() {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const data = await getCartWithBookDetails();
      setCartItems(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Không thể tải giỏ hàng", getUserFriendlyErrorMessage(error));
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = async (item) => {
    try {
      await updateCartItem(item.id, item.quantity + 1);
      fetchCart();
    } catch (error) {
      Alert.alert("Không thể cập nhật số lượng", getUserFriendlyErrorMessage(error));
    }
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity === 1) return;

    try {
      await updateCartItem(item.id, item.quantity - 1);
      fetchCart();
    } catch (error) {
      Alert.alert("Không thể cập nhật số lượng", getUserFriendlyErrorMessage(error));
    }
  };

  const removeItem = async (id) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này khỏi giỏ hàng?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await removeCartItem(id);
            fetchCart();
          } catch (error) {
            Alert.alert("Không thể xóa sản phẩm", getUserFriendlyErrorMessage(error));
          }
        },
      },
    ]);
  };

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cartItems]
  );

  const renderStars = (rating = 0) => (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= Math.round(rating) ? "star" : "star-outline"}
          size={14}
          color="#FFD700"
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const book = item.book;
    const imageUrl = book?.image || FALLBACK_IMAGE;

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title}>{book?.title || "Đang cập nhật"}</Text>
          <Text style={styles.author}>{book?.author || "Tác giả đang cập nhật"}</Text>
          {renderStars(book?.rating || 0)}
          <Text style={styles.price}>{item.price.toLocaleString("vi-VN")} đ</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={() => decreaseQuantity(item)}>
              <Ionicons name="remove-circle-outline" size={22} />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity onPress={() => increaseQuantity(item)}>
              <Ionicons name="add-circle-outline" size={22} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity onPress={() => removeItem(item.id)}>
          <Ionicons name="trash-outline" size={22} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

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

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
            <Text style={styles.emptyText}>Hãy thêm một vài cuốn sách bạn yêu thích.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>Tổng tiền: {totalPrice.toLocaleString("vi-VN")} đ</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  loading: { marginTop: 20 },
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
    flexDirection: "row",
    backgroundColor: "#FFF",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  image: {
    width: 70,
    height: 100,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    marginHorizontal: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
  },
  author: {
    fontSize: 12,
    color: "gray",
  },
  stars: {
    flexDirection: "row",
    marginTop: 4,
  },
  price: {
    color: "#1E88E5",
    fontWeight: "bold",
    marginVertical: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  footer: {
    padding: 15,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#DDD",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
    color: "#E53935",
  },
  emptyState: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6B7280",
  },
});
