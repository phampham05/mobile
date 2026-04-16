import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useCallback, useContext, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { UserContext } from "../../context/UserContext";
import { getBooks } from "../../services/bookService";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const CATEGORIES = [
  { key: "fiction", label: "Fiction", icon: "book-outline" },
  { key: "biography", label: "Biography", icon: "people-outline" },
  { key: "sci-fi", label: "Sci-Fi", icon: "rocket-outline" },
  { key: "academic", label: "Academic", icon: "school-outline" },
];

const FALLBACK_IMAGE = "https://via.placeholder.com/300x420.png?text=Book";

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default function Home() {
  const { user } = useContext(UserContext);

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const fetchHomeBooks = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError("");

      const [featuredResult, latestResult] = await Promise.all([
        getBooks({ page: 0, size: 6, sort: "popular" }),
        getBooks({ page: 0, size: 8 }),
      ]);

      setFeaturedBooks(Array.isArray(featuredResult.items) ? featuredResult.items : []);
      setLatestBooks(Array.isArray(latestResult.items) ? latestResult.items : []);
    } catch (error) {
      console.log("Lỗi khi lấy dữ liệu trang chủ:", error);
      setLoadError(getUserFriendlyErrorMessage(error));
      setFeaturedBooks([]);
      setLatestBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeBooks(true);
    }, [fetchHomeBooks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeBooks(false);
  }, [fetchHomeBooks]);

  const filteredFeaturedBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return featuredBooks;

    return featuredBooks.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const author = item.author?.toLowerCase() ?? "";
      return title.includes(keyword) || author.includes(keyword);
    });
  }, [featuredBooks, search]);

  const filteredLatestBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return latestBooks;

    return latestBooks.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const author = item.author?.toLowerCase() ?? "";
      return title.includes(keyword) || author.includes(keyword);
    });
  }, [latestBooks, search]);

  const showBookDetailDisabledNotice = () => {
    Alert.alert("Tạm thời không khả dụng", "Phần chi tiết sách đang được tạm đóng.");
  };

  const renderFeaturedCard = (item) => (
    <Pressable key={item.id} style={styles.featuredCard} onPress={showBookDetailDisabledNotice}>
      <Image source={{ uri: item.image || FALLBACK_IMAGE }} style={styles.featuredImage} />
      <View style={styles.featuredOverlay} />
      <View style={styles.featuredContent}>
        <Text style={styles.featuredBadge}>EDITOR&apos;S PICK</Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    </Pressable>
  );

  const renderLatestItem = ({ item }) => (
    <Pressable style={styles.latestCard} onPress={showBookDetailDisabledNotice}>
      <Image source={{ uri: item.image || FALLBACK_IMAGE }} style={styles.latestImage} />
      <View style={styles.latestInfo}>
        <Text style={styles.latestTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.latestAuthor} numberOfLines={1}>
          Tác giả: {item.author || "Đang cập nhật"}
        </Text>
        <View style={styles.latestMeta}>
          <Text style={styles.latestPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#6B7280" />
            <Text style={styles.latestRating}>{Number(item.rating ?? 0).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1149D8" />
        <Text style={styles.loadingText}>Đang tải trang chủ...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton}>
          <Ionicons name="menu" size={24} color="#1149D8" />
        </Pressable>
        <Text style={styles.brand}>BookStore</Text>
        <Pressable style={styles.iconButton}>
          <Ionicons name="search" size={22} color="#1149D8" />
        </Pressable>
      </View>

      <Text style={styles.pageTitle}>Trang chủ</Text>
      <Text style={styles.pageSubtitle}>
        Chào mừng {user?.name ? user.name.split(" ").slice(-1)[0] : "bạn"} đến với không gian đọc sách tối giản.
      </Text>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={22} color="#687385" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm tựa sách, tác giả..."
          placeholderTextColor="#7D8796"
          style={styles.searchInput}
        />
      </View>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#B42318" />
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Sách nổi bật</Text>
        <Pressable onPress={onRefresh}>
          <Text style={styles.sectionLink}>Xem tất cả</Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
        {filteredFeaturedBooks.map(renderFeaturedCard)}
      </ScrollView>

      <Text style={styles.sectionTitle}>Danh mục</Text>
      <View style={styles.categoryRow}>
        {CATEGORIES.map((category) => (
          <View key={category.key} style={styles.categoryItem}>
            <View style={styles.categoryIconWrap}>
              <Ionicons name={category.icon} size={24} color="#4B5563" />
            </View>
            <Text style={styles.categoryLabel}>{category.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderTitle}>Sách mới về</Text>
        <Pressable onPress={onRefresh}>
          <Text style={styles.sectionLink}>Xem tất cả</Text>
        </Pressable>
      </View>

      {filteredLatestBooks.length ? (
        <FlatList
          data={filteredLatestBooks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderLatestItem}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.spacer} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chưa có sách để hiển thị</Text>
          <Text style={styles.emptyText}>Kiểm tra lại dữ liệu trong cơ sở dữ liệu hoặc từ khóa tìm kiếm.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F8FB",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F8FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4B5563",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 20,
    fontStyle: "italic",
    fontWeight: "700",
    color: "#1149D8",
  },
  pageTitle: {
    marginTop: 24,
    fontSize: 30,
    fontWeight: "800",
    color: "#171B23",
  },
  pageSubtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
  },
  searchBox: {
    marginTop: 26,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8ECF3",
    borderRadius: 999,
    paddingHorizontal: 18,
    minHeight: 58,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 18,
    color: "#1F2937",
  },
  errorBanner: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FEE4E2",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#B42318",
  },
  sectionHeader: {
    marginTop: 34,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionHeaderTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: "#171B23",
  },
  sectionTitle: {
    marginTop: 34,
    marginBottom: 16,
    fontSize: 25,
    fontWeight: "800",
    color: "#171B23",
  },
  sectionLink: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1149D8",
  },
  featuredRow: {
    paddingRight: 24,
    gap: 18,
  },
  featuredCard: {
    width: 260,
    height: 324,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#D9DEE8",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
  },
  featuredContent: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#1149D8",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
    color: "#FFFFFF",
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  categoryItem: {
    width: "23%",
    alignItems: "center",
  },
  categoryIconWrap: {
    width: 66,
    height: 66,
    borderRadius: 18,
    backgroundColor: "#DCE4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#313847",
  },
  latestCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F8",
    borderRadius: 22,
    padding: 16,
  },
  latestImage: {
    width: 82,
    height: 112,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
  },
  latestInfo: {
    flex: 1,
    marginLeft: 16,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171B23",
    lineHeight: 26,
  },
  latestAuthor: {
    marginTop: 10,
    fontSize: 15,
    color: "#6B7280",
  },
  latestMeta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  latestPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1149D8",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  latestRating: {
    color: "#6B7280",
    fontSize: 14,
  },
  spacer: {
    height: 14,
  },
  emptyState: {
    backgroundColor: "#EEF2F8",
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#171B23",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
  },
});
