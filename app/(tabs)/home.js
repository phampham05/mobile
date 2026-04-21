import {
  Alert,
  ActivityIndicator,
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
import { useFocusEffect, useRouter } from "expo-router";
import AppTopBar from "../../components/AppTopBar";
import { UserContext } from "../../context/UserContext";
import { getBooks } from "../../services/bookService";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const CATEGORIES = [
  {
    key: "fiction",
    label: "Hư cấu",
    icon: "book-outline",
    backgroundColor: "#DBE2F9",
    iconBackgroundColor: "#FFFFFF",
    iconColor: "#005CC1",
  },
  {
    key: "biography",
    label: "Tiểu sử",
    icon: "person-outline",
    backgroundColor: "#EAEFF2",
    iconBackgroundColor: "#FFFFFF",
    iconColor: "#685781",
  },
  {
    key: "psychology",
    label: "Tâm lý",
    icon: "bulb-outline",
    backgroundColor: "#EAEFF2",
    iconBackgroundColor: "#FFFFFF",
    iconColor: "#0050AA",
  },
  {
    key: "science",
    label: "Khoa học",
    icon: "rocket-outline",
    backgroundColor: "#EAEFF2",
    iconBackgroundColor: "#FFFFFF",
    iconColor: "#A83836",
  },
];

const FEATURED_THEMES = [
  {
    badge: "Xu hướng",
    backgroundColor: "#005CC1",
    accentColor: "#0050AA",
    buttonText: "Xem ngay",
  },
  {
    badge: "Xu hướng",
    backgroundColor: "#685781",
    accentColor: "#5C4B74",
    buttonText: "Xem ngay",
  },
  {
    badge: "Xu hướng",
    backgroundColor: "#1dd8cc",
    accentColor: "#1E3A8A",
    buttonText: "Xem ngay",
  },
];

const FALLBACK_IMAGE = "https://via.placeholder.com/300x420.png?text=Book";

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function resolveBookId(book) {
  return typeof book?.id === "string" ? book.id : "";
}

function getLastName(name) {
  if (!name) {
    return "bạn";
  }

  return name.trim().split(/\s+/).slice(-1)[0];
}

export default function Home() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [latestBooks, setLatestBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");

  const goToBookDetail = useCallback(
    (id, book) => {
      console.log("Navigate to book detail:", { id, book });

      if (!isUuid(id)) {
        Alert.alert("Thông báo", "Mã sách không hợp lệ.");
        return;
      }

      router.push(`/book/${id}`);
    },
    [router]
  );

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
    if (!keyword) {
      return featuredBooks;
    }

    return featuredBooks.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const author = item.author?.toLowerCase() ?? "";
      return title.includes(keyword) || author.includes(keyword);
    });
  }, [featuredBooks, search]);

  const filteredLatestBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return latestBooks;
    }

    return latestBooks.filter((item) => {
      const title = item.title?.toLowerCase() ?? "";
      const author = item.author?.toLowerCase() ?? "";
      return title.includes(keyword) || author.includes(keyword);
    });
  }, [latestBooks, search]);

  const userName = user?.name?.trim() || "";
  const greetingName = userName || "bạn";

  const renderFeaturedCard = (item, index) => {
    const theme = FEATURED_THEMES[index % FEATURED_THEMES.length];
    const bookId = resolveBookId(item);

    return (
      <Pressable
        key={String(bookId || item.title || index)}
        style={[styles.featuredCard, { backgroundColor: theme.backgroundColor }]}
        onPress={() => goToBookDetail(bookId, item)}
      >
        <View style={[styles.featuredGlow, { backgroundColor: theme.accentColor }]} />

        <View style={styles.featuredCopy}>
          <View>
            <Text style={styles.featuredBadge}>{theme.badge}</Text>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={styles.featuredAuthor} numberOfLines={1}>
              {item.author || "Đang cập nhật"}
            </Text>
          </View>

          <View style={styles.featuredFooter}>
            <Text style={styles.featuredButton}>{theme.buttonText}</Text>
          </View>
        </View>

        <Image source={{ uri: item.image || FALLBACK_IMAGE }} style={styles.featuredBookImage} />
      </Pressable>
    );
  };

  const renderLatestCard = (item, index) => {
    const bookId = resolveBookId(item);

    return (
    <Pressable
      key={String(bookId || item.title || index)}
      style={styles.latestCard}
      onPress={() => goToBookDetail(bookId, item)}
    >
      <Image source={{ uri: item.image || FALLBACK_IMAGE }} style={styles.latestImage} />

      <Text style={styles.latestTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.latestAuthor} numberOfLines={1}>
        {item.author || "Đang cập nhật"}
      </Text>

      <View style={styles.latestMeta}>
        <Text style={styles.latestPrice}>{formatCurrency(item.price)}</Text>
      </View>
    </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CC1" />
        <Text style={styles.loadingText}>Đang tải trang chủ...</Text>
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

      <View style={styles.greetingSection}>
        <Text style={styles.greetingTitle}>Chào {greetingName},</Text>
        <Text style={styles.greetingSubtitle}>Cùng khám phá những cuốn sách mới hôm nay nào!</Text>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color="#596064" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm kiếm sách, tác giả..."
          placeholderTextColor="#596064"
          style={styles.searchInput}
        />
      </View>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#6E0A12" />
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sách nổi bật</Text>
        <Pressable onPress={() => router.push("/(tabs)/explore")}>
          <Text style={styles.sectionLink}>Xem tất cả</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.featuredList}
      >
        {filteredFeaturedBooks.length ? (
          filteredFeaturedBooks.map(renderFeaturedCard)
        ) : (
          <View style={styles.emptyFeaturedState}>
            <Text style={styles.emptyTitle}>Chưa có sách nổi bật</Text>
            <Text style={styles.emptyText}>Hãy thử làm mới để đồng bộ thêm dữ liệu từ hệ thống.</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((category) => (
            <View key={category.key} style={[styles.categoryCard, { backgroundColor: category.backgroundColor }]}>
              <View
                style={[
                  styles.categoryIconWrap,
                  { backgroundColor: category.iconBackgroundColor },
                ]}
              >
                <Ionicons name={category.icon} size={20} color={category.iconColor} />
              </View>
              <Text style={styles.categoryLabel}>{category.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sách mới về</Text>
        <Pressable onPress={() => router.push("/(tabs)/explore")}>
          <Text style={styles.sectionLink}>Xem tất cả</Text>
        </Pressable>
      </View>

      {filteredLatestBooks.length ? (
        <View style={styles.latestGrid}>{filteredLatestBooks.map(renderLatestCard)}</View>
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
    backgroundColor: "#F7F9FB",
  },
  content: {
    paddingBottom: 128,
  },
  headerSpacer: {
    paddingBottom: 128,
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
  greetingSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  greetingTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2C3437",
    lineHeight: 36,
  },
  greetingSubtitle: {
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    color: "#596064",
    fontWeight: "500",
  },
  searchBox: {
    marginTop: 22,
    marginHorizontal: 24,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#E3E9ED",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3437",
  },
  errorBanner: {
    marginTop: 14,
    marginHorizontal: 24,
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
  sectionHeader: {
    marginTop: 30,
    marginBottom: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionBlock: {
    marginTop: 30,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#2C3437",
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005CC1",
  },
  featuredList: {
    paddingLeft: 24,
    paddingRight: 24,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    minHeight: 216,
    borderRadius: 22,
    padding: 18,
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
  },
  featuredGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
    borderRadius: 22,
  },
  featuredCopy: {
    flex: 1,
    width: "66%",
    justifyContent: "space-between",
    zIndex: 2,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  featuredTitle: {
    marginTop: 10,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  featuredAuthor: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.82)",
  },
  featuredFooter: {
    marginTop: 18,
  },
  featuredButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    color: "#005CC1",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 13,
    fontWeight: "800",
    overflow: "hidden",
  },
  featuredBookImage: {
    position: "absolute",
    right: -16,
    bottom: -8,
    width: 118,
    height: 168,
    borderRadius: 8,
    transform: [{ rotate: "12deg" }],
  },
  emptyFeaturedState: {
    width: 280,
    minHeight: 180,
    borderRadius: 22,
    backgroundColor: "#EAEFF2",
    padding: 18,
    justifyContent: "center",
  },
  categoryGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  categoryCard: {
    width: "48%",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#2C3437",
  },
  latestGrid: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },
  latestCard: {
    width: "47.8%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(172,179,183,0.2)",
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  latestImage: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: 12,
    backgroundColor: "#DCE4E8",
    marginBottom: 12,
  },
  latestTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2C3437",
  },
  latestAuthor: {
    marginTop: 4,
    fontSize: 11,
    color: "#596064",
  },
  latestMeta: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  latestPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  emptyState: {
    marginHorizontal: 24,
    backgroundColor: "#EAEFF2",
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3437",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#596064",
  },
});
