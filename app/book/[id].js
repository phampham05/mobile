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
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { getBookById } from "../../services/bookService";
import { addToCart } from "../../services/cartService";

export default function BookDetail() {
  const { id } = useLocalSearchParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchBookDetail();
  }, []);

  /**
   * Lấy chi tiết sách từ API Spring Boot
   * GET /books/{id}
   */
  const fetchBookDetail = async () => {
    try {
      const data = await getBookById(id);
      setBook(data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sách:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /cart
   */
  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1);
      Alert.alert("Thành công", "Đã thêm vào giỏ hàng!");
    } catch (error) {
      Alert.alert(
        "Thông báo",
        "Không thể thêm vào giỏ hàng. Vui lòng đăng nhập."
      );
    }
  };

  /**
   * Hiển thị số sao theo rating
   */
  const renderStars = (rating = 0) => {
    return (
      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= Math.round(rating) ? "star" : "star-outline"}
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
    book.image ||
    "https://via.placeholder.com/200x300.png?text=No+Image";

  return (
    <ScrollView style={styles.container}>
      {/* Hình ảnh sách */}
      <Image source={{ uri: imageUrl }} style={styles.image} />

      <View style={styles.content}>
        {/* Tên sách */}
        <Text style={styles.title}>{book.title}</Text>

        {/* Thông tin chi tiết */}
        <Text style={styles.author}>Tác giả: {book.author}</Text>
        <Text style={styles.category}>Thể loại: {book.category}</Text>

        {/* Đánh giá */}
        <View style={styles.ratingRow}>
          {renderStars(book.rating)}
          <Text style={styles.ratingText}>
            {book.rating?.toFixed(1) || "0.0"}/5
          </Text>
        </View>

        {/* Giá */}
        <Text style={styles.price}>
          {book.price.toLocaleString()} đ
        </Text>

        {/* Tồn kho */}
        <Text style={styles.stock}>
          Còn lại: {book.stock} sản phẩm
        </Text>

        {/* Nút thêm vào giỏ hàng */}
        <TouchableOpacity
          style={[
            styles.cartButton,
            book.stock === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={book.stock === 0}
        >
          <Text style={styles.cartText}>
            {book.stock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            router.push(
              `/orders/map?lat=${order.latitude}&lng=${order.longitude}`
            )
          }
        >
          <Text style={{ color: "white" }}>Xem bản đồ</Text>
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
});