import React, { useContext, useEffect, useMemo, useState, useCallback } from "react";
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
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const FALLBACK_IMAGE = "https://via.placeholder.com/100x150.png?text=No+Image";

export default function Cart() {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const isSelected = (id) => selectedItems.includes(id);
  const router = useRouter();
  const isAllSelected =
    cartItems.length > 0 &&
    selectedItems.length === cartItems.length;

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

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

  const toggleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
  };

  const totalPrice = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [cartItems, selectedItems]);

  const renderStars = (rating = 0) => {
    const safeRating = Number(rating) || 0;
  
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => {
          let iconName = "star-outline";
  
          if (safeRating >= star) {
            iconName = "star"; // full
          } else if (safeRating >= star - 0.5) {
            iconName = "star-half"; // half
          }
  
          return (
            <Ionicons
              key={star}
              name={iconName}
              size={14}
              color="#FFD700"
            />
          );
        })}
  
        {/* optional: hiển thị số */}
        <Text style={{ marginLeft: 4, fontSize: 12 }}>
          {safeRating.toFixed(1)}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const book = item.book;
    const imageUrl = book?.image || FALLBACK_IMAGE;

    return (
      <View style={styles.card}>
        
        {/* SELECT ITEM */}
        <TouchableOpacity 
          onPress={() => toggleSelectItem(item.id)}
          style={styles.checkbox}
        >
          <Ionicons
            name={isSelected(item.id) ? "checkbox" : "square-outline"}
            size={22}
            color={isSelected(item.id) ? "#1E88E5" : "#999"}
          />
        </TouchableOpacity>

        {/* CLICK AREA */}
        <TouchableOpacity
          style={{ flexDirection: "row", flex: 1 }}
          onPress={() =>
            router.push({
              pathname: "/book/[id]",
              params: { id: item.bookId },
            })
          }
        >
          {/* IMAGE */}
          <Image source={{ uri: imageUrl }} style={styles.image} />
  
          {/* INFO */}
          <View style={styles.info}>
            <Text style={styles.title}>{book?.title}</Text>
            <Text style={styles.author}>{book?.author}</Text>

            {renderStars(item?.book?.rating || 0)}

            <Text style={styles.price}>
              {item.price.toLocaleString("vi-VN")} đ
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
          
        </TouchableOpacity>
  
        {/* DELETE */}
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

      {/* SELECT ALL */}
      <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllContainer}>
        <Ionicons
          name={isAllSelected ? "checkbox" : "square-outline"}
          size={22}
          color={isAllSelected ? "#1E88E5" : "#999"}
        />

        <Text style={styles.selectAllText}>
          Chọn tất cả
        </Text>
      </TouchableOpacity>

      {/* TOTAL */}
      <Text style={styles.totalText}>
        Tổng tiền: {totalPrice.toLocaleString("vi-VN")} đ
      </Text>

      {/* CHECKOUT BUTTON */}
      <TouchableOpacity style={styles.checkoutBtn}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Thanh toán ({selectedItems.length})
        </Text>
      </TouchableOpacity>

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
  checkoutBtn: {
    marginTop: 10,
    backgroundColor: "#1E88E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  selectAllContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  selectAllText: {
    fontSize: 14,
    color: "#333",
  },
  checkbox: {
    marginRight: 8,
  },
});
