import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getCartWithBookDetails,
  updateCartItem,
  removeCartItem,
} from "../../services/cartService";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCartWithBookDetails();
      setCartItems(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = async (item) => {
    await updateCartItem(item.id, item.quantity + 1);
    fetchCart();
  };

  const decreaseQuantity = async (item) => {
    if (item.quantity === 1) return;
    await updateCartItem(item.id, item.quantity - 1);
    fetchCart();
  };

  const removeItem = async (id) => {
    Alert.alert("Xác nhận", "Bạn muốn xóa sản phẩm này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          await removeCartItem(id);
          fetchCart();
        },
      },
    ]);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  const renderStars = (rating = 0) => (
    <View style={{ flexDirection: "row" }}>
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
    const imageUrl =
      book?.image ||
      "https://via.placeholder.com/100x150.png?text=No+Image";

    return (
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.info}>
          <Text style={styles.title}>
            {book?.title || "Đang tải..."}
          </Text>

          <Text style={styles.author}>
            {book?.author || ""}
          </Text>

          {renderStars(book?.rating || 0)}

          <Text style={styles.price}>
            {item.price.toLocaleString()} đ
          </Text>

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

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#1E88E5"
        style={{ marginTop: 20 }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />

      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Tổng tiền: {totalPrice.toLocaleString()} đ
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
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
});