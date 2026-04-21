import {
  ActivityIndicator,
  Alert,
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
import { addToCart } from "../../services/cartService";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x420.png?text=Book";

const FILTER_CHIPS = [
  { key: "all", label: "Tất cả" },
  { key: "popular", label: "Bán chạy" },
  { key: "latest", label: "Mới nhất" },
  { key: "discounted", label: "Giảm giá" },
  { key: "classic", label: "Kinh điển" },
];

const CLASSIC_KEYWORDS = ["đắc nhân tâm", "nhà giả kim", "cha giàu", "kinh điển", "suối nguồn"];

function resolveBookId(book) {
  return typeof book?.id === "string" ? book.id : "";
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function formatCompactNumber(value) {
  const safe = Number(value || 0);

  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(safe >= 10000 ? 0 : 1).replace(".0", "")}k`;
  }

  return String(safe);
}

function normalizePrice(value) {
  return Number(value ?? 0);
}

function buildBookMeta(book, index, popularBookIds) {
  const title = book?.title?.toLowerCase?.() ?? "";
  const rating = Number(book?.rating ?? 0);
  const price = normalizePrice(book?.price);
  const originalPrice = normalizePrice(book?.originalPrice ?? book?.listPrice ?? book?.oldPrice);
  const hasDiscount = originalPrice > price && price > 0;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const isClassic =
    String(book?.category ?? "")
      .toLowerCase()
      .includes("classic") || CLASSIC_KEYWORDS.some((keyword) => title.includes(keyword));
  const isPopular = popularBookIds.has(resolveBookId(book)) || rating >= 4.8;
  const isNew = index < 6;
  const ratingCount = Number(book?.reviewCount ?? book?.ratingCount ?? book?.soldCount ?? 0);

  let badge = null;
  let badgeStyle = styles.badgePrimary;

  if (hasDiscount && discountPercent > 0) {
    badge = `-${discountPercent}%`;
    badgeStyle = styles.badgeError;
  } else if (isPopular) {
    badge = "Bán chạy";
    badgeStyle = styles.badgePrimary;
  } else if (isNew) {
    badge = "Mới";
    badgeStyle = styles.badgeSecondary;
  }

  return {
    badge,
    badgeStyle,
    hasDiscount,
    discountPercent,
    originalPrice,
    isClassic,
    isPopular,
    isNew,
    rating,
    ratingCount,
  };
}

export default function Explore() {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [allBooks, setAllBooks] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [addingBookId, setAddingBookId] = useState(null);

  const fetchExploreBooks = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError("");

      const [latestResult, popularResult] = await Promise.all([
        getBooks({ page: 0, size: 24 }),
        getBooks({ page: 0, size: 24, sort: "popular" }),
      ]);

      setAllBooks(Array.isArray(latestResult.items) ? latestResult.items : []);
      setPopularBooks(Array.isArray(popularResult.items) ? popularResult.items : []);
    } catch (error) {
      console.log("Lỗi khi lấy dữ liệu khám phá:", error);
      setLoadError(getUserFriendlyErrorMessage(error));
      setAllBooks([]);
      setPopularBooks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchExploreBooks(true);
    }, [fetchExploreBooks])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchExploreBooks(false);
  }, [fetchExploreBooks]);

  const popularBookIds = useMemo(
    () => new Set(popularBooks.map((item) => resolveBookId(item)).filter(Boolean)),
    [popularBooks]
  );

  const preparedBooks = useMemo(
    () =>
      allBooks.map((book, index) => ({
        ...book,
        meta: buildBookMeta(book, index, popularBookIds),
      })),
    [allBooks, popularBookIds]
  );

  const filteredBooks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let nextBooks = preparedBooks.filter((book) => {
      const title = book?.title?.toLowerCase?.() ?? "";
      const author = book?.author?.toLowerCase?.() ?? "";
      return !keyword || title.includes(keyword) || author.includes(keyword);
    });

    switch (activeFilter) {
      case "popular":
        nextBooks = nextBooks.filter((book) => book.meta.isPopular);
        break;
      case "latest":
        nextBooks = nextBooks.filter((_, index) => index < 12);
        break;
      case "discounted":
        nextBooks = nextBooks.filter((book) => book.meta.hasDiscount);
        break;
      case "classic":
        nextBooks = nextBooks.filter((book) => book.meta.isClassic);
        break;
      default:
        break;
    }

    return nextBooks;
  }, [activeFilter, preparedBooks, search]);

  const goToBookDetail = useCallback(
    (id, book) => {
      console.log("Navigate to book detail:", { id, book });

      if (!isUuid(id)) {
        Alert.alert("ThĂ´ng bĂ¡o", "MĂ£ sĂ¡ch khĂ´ng há»£p lá»‡.");
        return;
      }

      router.push(`/book/${id}`);
    },
    [router]
  );

  const handleAddToCart = useCallback(
    async (book) => {
      const bookId = resolveBookId(book);

      if (!user) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm sách vào giỏ hàng.");
        return;
      }

      if (!bookId) {
        Alert.alert("Thông báo", "Không xác định được mã sách để thêm vào giỏ hàng.");
        return;
      }

      try {
        setAddingBookId(bookId);
        await addToCart(bookId, 1);
        Alert.alert("Thành công", `Đã thêm "${book.title}" vào giỏ hàng.`);
      } catch (error) {
        Alert.alert("Thông báo", getUserFriendlyErrorMessage(error));
      } finally {
        setAddingBookId(null);
      }
    },
    [user]
  );

  const renderBookCard = (book) => {
    const bookId = resolveBookId(book);
    const imageUrl = book?.image || FALLBACK_IMAGE;

    return (
      <Pressable
        key={String(bookId || book.title)}
        style={styles.bookCard}
        onPress={() => goToBookDetail(bookId, book)}
      >
        <View style={styles.bookImageWrap}>
          <Image source={{ uri: imageUrl }} style={styles.bookImage} />

          <Pressable
            style={styles.cartButton}
            onPress={() => handleAddToCart(book)}
            disabled={addingBookId === bookId}
          >
            {addingBookId === bookId ? (
              <ActivityIndicator size="small" color="#005CC1" />
            ) : (
              <Ionicons name="bag-handle" size={18} color="#005CC1" />
            )}
          </Pressable>

          {book.meta.badge ? (
            <View style={[styles.bookBadge, book.meta.badgeStyle]}>
              <Text style={styles.bookBadgeText}>{book.meta.badge}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.bookTitle} numberOfLines={1}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.author || "Đang cập nhật"}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingValue}>{book.meta.rating.toFixed(1)}</Text>
          {book.meta.ratingCount > 0 ? (
            <Text style={styles.ratingCount}>({formatCompactNumber(book.meta.ratingCount)})</Text>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.bookPrice}>{formatCurrency(book.price)}</Text>
          {book.meta.hasDiscount ? (
            <Text style={styles.originalPrice}>{formatCurrency(book.meta.originalPrice)}</Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CC1" />
        <Text style={styles.loadingText}>Đang tải trang khám phá...</Text>
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

      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#596064" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Tìm tên sách, tác giả..."
            placeholderTextColor="#596064"
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
        contentContainerStyle={styles.chipRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.key === activeFilter;

          return (
            <Pressable
              key={chip.key}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              onPress={() => setActiveFilter(chip.key)}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : styles.chipTextInactive]}>
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loadError ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color="#6E0A12" />
          <Text style={styles.errorText}>{loadError}</Text>
        </View>
      ) : null}

      <View style={styles.productHeader}>
        <Text style={styles.sectionTitle}>Khám phá sách mới</Text>
        <Text style={styles.resultCount}>{filteredBooks.length} kết quả</Text>
      </View>

      {filteredBooks.length ? (
        <View style={styles.bookGrid}>{filteredBooks.map(renderBookCard)}</View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Không tìm thấy sách phù hợp</Text>
          <Text style={styles.emptyText}>Hãy thử từ khóa khác hoặc chuyển sang bộ lọc khác.</Text>
        </View>
      )}

      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Gói Hội Viên Premium</Text>
          <Text style={styles.bannerText}>
            Nhận ưu đãi giảm giá 10% cho mọi đơn hàng và mượn sách miễn phí hàng tháng.
          </Text>
          <Pressable style={styles.bannerButton}>
            <Text style={styles.bannerButtonText}>Đăng Ký Ngay</Text>
          </Pressable>
        </View>

        <Ionicons name="library" size={146} color="rgba(255,255,255,0.18)" style={styles.bannerIcon} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  content: {
    paddingTop: 0,
    paddingBottom: 120,
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
  searchSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  searchBox: {
    minHeight: 52,
    borderRadius: 999,
    backgroundColor: "#E3E9ED",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#2C3437",
  },
  chipScroll: {
    marginTop: 16,
  },
  chipRow: {
    paddingHorizontal: 24,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: "#005CC1",
  },
  chipInactive: {
    backgroundColor: "#DBE2F9",
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#F9F8FF",
  },
  chipTextInactive: {
    color: "#4A5264",
  },
  errorBanner: {
    marginTop: 16,
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
  productHeader: {
    marginTop: 24,
    marginBottom: 22,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    color: "#2C3437",
  },
  resultCount: {
    marginLeft: 12,
    fontSize: 11,
    fontWeight: "700",
    color: "#005CC1",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  bookGrid: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 26,
  },
  bookCard: {
    width: "47.5%",
  },
  bookImageWrap: {
    position: "relative",
    aspectRatio: 2 / 3,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F0F4F7",
  },
  bookImage: {
    width: "100%",
    height: "100%",
  },
  cartButton: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.88)",
    alignItems: "center",
    justifyContent: "center",
  },
  bookBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgePrimary: {
    backgroundColor: "rgba(0,92,193,0.92)",
  },
  badgeError: {
    backgroundColor: "rgba(168,56,54,0.92)",
  },
  badgeSecondary: {
    backgroundColor: "rgba(75,83,102,0.9)",
  },
  bookBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2C3437",
  },
  bookAuthor: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "500",
    color: "#596064",
  },
  ratingRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingValue: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2C3437",
  },
  ratingCount: {
    fontSize: 11,
    color: "#596064",
  },
  priceRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  bookPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  originalPrice: {
    fontSize: 10,
    color: "#596064",
    textDecorationLine: "line-through",
  },
  emptyState: {
    marginHorizontal: 24,
    borderRadius: 20,
    backgroundColor: "#EAEFF2",
    padding: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2C3437",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#596064",
  },
  banner: {
    marginTop: 28,
    marginHorizontal: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#005CC1",
    padding: 24,
    position: "relative",
  },
  bannerContent: {
    width: "72%",
    zIndex: 2,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#F9F8FF",
  },
  bannerText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(249,248,255,0.84)",
  },
  bannerButton: {
    alignSelf: "flex-start",
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  bannerIcon: {
    position: "absolute",
    right: -22,
    bottom: -26,
  },
});
