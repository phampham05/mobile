import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useContext } from "react";
import { Ionicons } from "@expo/vector-icons";

import { getBookById } from "../../services/bookService";
import { addToCart } from "../../services/cartService";
import { UserContext } from "../../context/UserContext";

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const bookId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { user } = useContext(UserContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!bookId) return;
    fetchBookDetail();
  }, [bookId]);

  const fetchBookDetail = async () => {
    try {
      setLoading(true);
      const data = await getBookById(bookId);
      setBook(data ?? null);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sách:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ server.");
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const stock = book?.stock ?? 0;

  const increaseQty = () => {
    setQuantity((prev) => {
      if (prev >= stock) return prev;
      return prev + 1;
    });
  };

  const decreaseQty = () => {
    setQuantity((prev) => {
      if (prev <= 1) return prev;
      return prev - 1;
    });
  };

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm vào giỏ hàng.");
      return;
    }

    if (quantity < 1 || quantity > stock) {
      Alert.alert("Thông báo", "Số lượng không hợp lệ.");
      return;
    }

    try {
      setAdding(true);
      const res = await addToCart(bookId, quantity);
      const addedBook = book?.title || "Sách";

      Alert.alert("Thành công", `Đã thêm ${quantity} "${addedBook}" vào giỏ hàng!`);
      setQuantity(1);
    } catch (error) {
      Alert.alert("Thông báo", "Không thể thêm vào giỏ hàng.");
    } finally {
      setAdding(false);
    }
  };

  const handleCheckout = () => {
    if (quantity < 1 || quantity > stock) {
      Alert.alert("Thông báo", "Số lượng không hợp lệ.");
      return;
    }
  };

  const renderStars = (rating = 0) => {
    const safe = Number(rating) || 0;
  
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={safe >= star ? "star" : "star-outline"}
            size={18}
            color="#FFD700"
          />
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#1E88E5"
        style={{ marginTop: 50 }}
      />
    );
  }

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const imageUrl =
    book.image || "https://via.placeholder.com/200x300.png?text=No+Image";

  const price = book.price ?? 0;
  const safeRating = Number(book?.rating) || 0;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{book.title}</Text>

        <Text style={styles.author}>Tác giả: {book.author}</Text>
        <Text style={styles.category}>Thể loại: {book.category}</Text>

        <View style={styles.ratingRow}>
          {renderStars(safeRating)}
            <Text style={styles.ratingText}>
              {safeRating.toFixed(1)}/5
            </Text>
        </View>

        <Text style={styles.price}>
          {price.toLocaleString("vi-VN")} đ
        </Text>

        <Text style={styles.stock}>
          {stock > 0 ? `Còn lại: ${stock}` : "Hết hàng"}
        </Text>

        <View style={styles.qtyContainer}>
          <TouchableOpacity onPress={decreaseQty} style={styles.qtyBtn}>
            <Ionicons name="remove" size={20} />
          </TouchableOpacity>

          <Text style={styles.qtyText}>{quantity}</Text>

          <TouchableOpacity onPress={increaseQty} style={styles.qtyBtn}>
            <Ionicons name="add" size={20} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.cartButton,
            (stock === 0 || adding) && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={stock === 0 || adding}
        >
          <Text style={styles.cartText}>
            {adding
              ? "Đang thêm..."
              : stock === 0
              ? "Hết hàng"
              : "Thêm vào giỏ hàng"}
          </Text>
        </TouchableOpacity>

        {/* CHECKOUT */}
        <TouchableOpacity
          style={[
            styles.checkoutButton,
            stock === 0 && styles.disabledButton,
          ]}
          onPress={handleCheckout}
          disabled={stock === 0}
        >
          <Text style={styles.checkoutText}>Thanh toán</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 320,
    resizeMode: "contain",
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  author: {
    marginTop: 5,
    color: "gray",
    fontSize: 14,
  },
  category: {
    color: "gray",
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 14,
  },
  starContainer: {
    flexDirection: "row",
  },
  price: {
    fontSize: 20,
    color: "#1E88E5",
    fontWeight: "bold",
    marginVertical: 5,
  },
  stock: {
    color: "green",
    marginBottom: 12,
  },
  cartButton: {
    backgroundColor: "#1E88E5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "gray",
  },
  cartText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  mapButton: {
    marginTop: 10,
    backgroundColor: "#1E88E5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
  },
  
  qtyBtn: {
    backgroundColor: "#E5E7EB",
    padding: 10,
    borderRadius: 8,
  },
  
  qtyText: {
    marginHorizontal: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
  
  checkoutButton: {
    backgroundColor: "#16A34A",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});