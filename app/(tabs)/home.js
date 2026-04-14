import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect, useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRouter } from "expo-router";
import api from "../../services/api";

export default function Home() {
  const navigation = useNavigation();
  const router = useRouter();

  const [user, setUser] = useState({ name: "Khách" });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách sách từ API
  const fetchBooks = async () => {
    try {
      const response = await api.get("/books");
      setBooks(response.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Hiển thị lời chào
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  // Cấu hình header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "left",
      headerTitle: () => (
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || "Khách"}</Text>
        </View>
      ),
      headerRight: () => (
        <Ionicons
          name="search"
          size={24}
          color="white"
          style={{ marginRight: 15 }}
        />
      ),
    });
  }, [user]);

  // Banner
  const renderBanner = () => (
    <View style={styles.bannerContainer}>
      <Image
        source={{
          uri: "https://st5.depositphotos.com/25867432/71460/v/450/depositphotos_714602852-stock-illustration-book-store-banner-vector-illustration.jpg",
        }}
        style={styles.bannerImage}
      />
    </View>
  );

  // Render từng sách
  const renderBook = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/book/${item.id}`)}
    >
      <Image
        source={{
          uri:
            item.image ||
            "https://via.placeholder.com/150x220.png?text=No+Image",
        }}
        style={styles.image}
      />

      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.author}>{item.author}</Text>

      <Text style={styles.price}>
        {Number(item.price).toLocaleString("vi-VN")}đ
      </Text>

      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={14} color="#FFD700" />
        <Text style={styles.ratingText}>
          {item.rating ? item.rating.toFixed(1) : "0.0"}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Hiển thị loading
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        ListHeaderComponent={renderBanner}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  bannerContainer: {
    marginTop: 15,
    marginBottom: 15,
    width: "100%",
    height: 200,
  },

  bannerImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },

  greeting: {
    color: "white",
    fontSize: 14,
  },

  userName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    flex: 1,
    backgroundColor: "white",
    margin: 8,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  image: {
    width: 100,
    height: 150,
    resizeMode: "cover",
  },

  title: {
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
  },

  author: {
    fontSize: 12,
    color: "gray",
    textAlign: "center",
  },

  price: {
    marginTop: 5,
    color: "#1E88E5",
    fontWeight: "bold",
  },

  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#333",
  },
});