import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import AppTopBar from "../../components/AppTopBar";
import { getBookById } from "../../services/bookService";
import { addToCart } from "../../services/cartService";
import { UserContext } from "../../context/UserContext";
import { getUserFriendlyErrorMessage } from "../../utils/errorMessages";

const FALLBACK_IMAGE = "https://via.placeholder.com/300x450.png?text=No+Image";

const FALLBACK_REVIEWS = [
  {
    id: "review-1",
    name: "An Nguyen",
    time: "2 ngày trước",
    rating: 5,
    initials: "AN",
    avatarColor: "#DBEAFE",
    avatarTextColor: "#005CC1",
    content: "Một cuốn sách tuyệt vời khiến bạn suy ngẫm về mọi quyết định trong đời. Rất đáng đọc!",
  },
  {
    id: "review-2",
    name: "Tuan Minh",
    time: "1 tuần trước",
    rating: 4,
    initials: "TM",
    avatarColor: "#F1F5F9",
    avatarTextColor: "#64748B",
    content: "Cốt truyện độc đáo và cách xây dựng nhân vật rất sâu sắc. Giao hàng nhanh, đóng gói kỹ.",
  },
];

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}

function formatCurrency(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

function renderStars(rating = 0, size = 18) {
  const safe = Number(rating) || 0;

  return [1, 2, 3, 4, 5].map((star) => {
    let iconName = "star-outline";

    if (safe >= star) {
      iconName = "star";
    } else if (safe >= star - 0.5) {
      iconName = "star-half";
    }

    return <Ionicons key={`${size}-${star}`} name={iconName} size={size} color="#EAB308" />;
  });
}

function getBookDescription(book) {
  return (
    book?.description ||
    book?.summary ||
    book?.content ||
    "Cuốn sách này đang được cập nhật phần mô tả chi tiết. Bạn có thể xem nhanh thông tin chính và thêm sách vào giỏ hàng ngay bây giờ."
  );
}

function getBookLanguage(book) {
  return book?.language || book?.lang || "English";
}

function getBookPageCount(book) {
  return book?.pageCount || book?.pages || book?.page || 304;
}

function getReviewCount(book) {
  return Number(book?.reviewCount ?? book?.ratingCount ?? book?.soldCount ?? 12500);
}

function formatReviewCount(value) {
  const safe = Number(value || 0);
  if (safe >= 1000) {
    return `${(safe / 1000).toFixed(1).replace(".0", "")}k`;
  }

  return String(safe);
}

export default function BookDetail() {
  const { id } = useLocalSearchParams();
  const rawBookId = Array.isArray(id) ? id[0] : id;
  const bookId =
    rawBookId && rawBookId !== "undefined" && rawBookId !== "null" ? String(rawBookId) : "";
  const router = useRouter();
  const { user } = useContext(UserContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);

  const fetchBookDetail = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      setLoadError("");

      if (!bookId) {
        setLoadError("Không xác định được mã sách.");
        setBook(null);
        return;
      }

      if (!isUuid(bookId)) {
        console.error("Book route param không hợp lệ:", { rawBookId, bookId });
        setLoadError("Mã sách không hợp lệ.");
        setBook(null);
        return;
      }

      const data = await getBookById(bookId);
      setBook(data ?? null);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết sách:", {
        rawBookId,
        bookId,
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message,
      });
      setLoadError(getUserFriendlyErrorMessage(error));
      setBook(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookId, rawBookId]);

  useEffect(() => {
    fetchBookDetail(true);
  }, [fetchBookDetail]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookDetail(false);
  }, [fetchBookDetail]);

  const stock = Number(book?.stock ?? 0);
  const safeRating = Number(book?.rating ?? 0);
  const pageCount = getBookPageCount(book);
  const reviewCount = getReviewCount(book);
  const reviews = useMemo(
    () => (Array.isArray(book?.reviews) && book.reviews.length ? book.reviews : FALLBACK_REVIEWS),
    [book?.reviews]
  );

  const performAddToCart = useCallback(
    async ({ redirectToCart = false } = {}) => {
      if (!user) {
        Alert.alert("Thông báo", "Bạn cần đăng nhập để thêm sách vào giỏ hàng.");
        return false;
      }

      if (!bookId || stock < 1) {
        Alert.alert("Thông báo", "Sách hiện đang hết hàng.");
        return false;
      }

      try {
        if (redirectToCart) {
          setBuying(true);
        } else {
          setAdding(true);
        }

        await addToCart(bookId, 1);

        if (redirectToCart) {
          router.push("/(tabs)/cart");
        } else {
          Alert.alert("Thành công", `Đã thêm "${book?.title || "Sách"}" vào giỏ hàng.`);
        }

        return true;
      } catch (error) {
        Alert.alert("Thông báo", getUserFriendlyErrorMessage(error));
        return false;
      } finally {
        setAdding(false);
        setBuying(false);
      }
    },
    [book?.title, bookId, router, stock, user]
  );

  const handleAddToCart = useCallback(() => {
    performAddToCart({ redirectToCart: false });
  }, [performAddToCart]);

  const handleBuyNow = useCallback(() => {
    performAddToCart({ redirectToCart: true });
  }, [performAddToCart]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#005CC1" />
        <Text style={styles.loadingText}>Đang tải chi tiết sách...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ headerShown: false, title: "" }} />
        <Ionicons name="book-outline" size={72} color="#94A3B8" />
        <Text style={styles.emptyTitle}>Không tìm thấy sản phẩm</Text>
        <Text style={styles.emptyText}>{loadError || "Sách bạn tìm kiếm không còn khả dụng."}</Text>
      </View>
    );
  }

  const imageUrl = book.image || FALLBACK_IMAGE;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: "" }} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#005CC1" />}
      >
        <AppTopBar onLeftPress={() => router.back()} />

      <View style={styles.mainContent}>
        {loadError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#6E0A12" />
            <Text style={styles.errorText}>{loadError}</Text>
          </View>
        ) : null}

        <View style={styles.heroSection}>
          <View style={styles.imageColumn}>
            <View style={styles.bookFrame}>
              <Image source={{ uri: imageUrl }} style={styles.bookImage} />
            </View>
          </View>

          <View style={styles.metaColumn}>
            <View style={styles.metaHeader}>
              <Text style={styles.categoryBadge}>{book?.category || "Fiction"}</Text>
              <Text style={styles.priceText}>{formatCurrency(book?.price)}</Text>
              <Text style={styles.title}>{book?.title}</Text>
              <Text style={styles.author}>{book?.author || "Đang cập nhật"}</Text>
            </View>

            <View style={styles.ratingRow}>
              <View style={styles.ratingPill}>
                <Ionicons name="star" size={18} color="#EAB308" />
                <Text style={styles.ratingPillText}>{safeRating.toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewCount}>{formatReviewCount(reviewCount)} Đánh giá</Text>
            </View>

            <View style={styles.metaGrid}>
              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Trang</Text>
                <Text style={styles.metaValue}>{pageCount}</Text>
              </View>

              <View style={styles.metaCard}>
                <Text style={styles.metaLabel}>Ngôn ngữ</Text>
                <Text style={styles.metaValue}>{getBookLanguage(book)}</Text>
              </View>
            </View>

            <Text style={[styles.stockText, stock < 1 && styles.stockTextSoldOut]}>
              {stock > 0 ? `Còn lại ${stock} cuốn` : "Hết hàng"}
            </Text>
          </View>
        </View>

        <View style={styles.inlineActionBar}>
          <Pressable
            style={[styles.addToCartButton, (adding || stock < 1) && styles.disabledOutlineButton]}
            onPress={handleAddToCart}
            disabled={adding || stock < 1 || buying}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#005CC1" />
            ) : (
              <>
                <Ionicons name="bag-handle-outline" size={18} color="#005CC1" />
                <Text style={styles.addToCartButtonText}>Thêm vào giỏ</Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={[styles.buyNowButton, (buying || stock < 1) && styles.disabledBuyButton]}
            onPress={handleBuyNow}
            disabled={buying || stock < 1 || adding}
          >
            {buying ? (
              <ActivityIndicator size="small" color="#F9F8FF" />
            ) : (
              <Text style={styles.buyNowButtonText}>Mua ngay</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.descriptionShell}>
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Về cuốn sách này</Text>
            <Text style={styles.descriptionText}>{getBookDescription(book)}</Text>
          </View>
        </View>

        <View style={styles.reviewSection}>
          <View style={styles.reviewSectionHeader}>
            <Text style={styles.sectionTitle}>Đánh giá khách hàng</Text>
            <Pressable>
              <Text style={styles.sectionLink}>Xem tất cả</Text>
            </Pressable>
          </View>

          <View style={styles.reviewList}>
            {reviews.map((review, index) => {
              const name = review?.name || review?.userName || `Khách hàng ${index + 1}`;
              const initials =
                review?.initials ||
                name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase();
              const time = review?.time || review?.createdAt || "Gần đây";
              const reviewRating = Number(review?.rating ?? 5);
              const content = review?.content || review?.comment || review?.message || "Đánh giá đang được cập nhật.";

              return (
                <View key={review?.id || `review-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerRow}>
                      <View
                        style={[
                          styles.reviewerAvatar,
                          {
                            backgroundColor: review?.avatarColor || (index % 2 === 0 ? "#DBEAFE" : "#F1F5F9"),
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.reviewerAvatarText,
                            {
                              color: review?.avatarTextColor || (index % 2 === 0 ? "#005CC1" : "#64748B"),
                            },
                          ]}
                        >
                          {initials}
                        </Text>
                      </View>

                      <View style={styles.reviewerMeta}>
                        <Text style={styles.reviewerName}>{name}</Text>
                        <Text style={styles.reviewTime}>{time}</Text>
                      </View>
                    </View>

                    <View style={styles.reviewStars}>{renderStars(reviewRating, 14)}</View>
                  </View>

                  <Text style={styles.reviewContent}>{`"${content}"`}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F9FB",
  },
  content: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
    backgroundColor: "#F7F9FB",
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 22,
    fontWeight: "800",
    color: "#2C3437",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#596064",
  },
  mainContent: {
    paddingTop: 24,
  },
  errorBanner: {
    marginHorizontal: 24,
    marginBottom: 12,
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
  heroSection: {
    paddingHorizontal: 24,
  },
  imageColumn: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  bookFrame: {
    borderRadius: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  bookImage: {
    width: 260,
    height: 390,
    borderRadius: 16,
    backgroundColor: "#EAEFF2",
  },
  metaColumn: {
    gap: 22,
  },
  metaHeader: {
    gap: 10,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#DBE2F9",
    fontSize: 10,
    fontWeight: "700",
    color: "#4A5264",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  priceText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#005CC1",
  },
  title: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: "800",
    color: "#2C3437",
    letterSpacing: -0.8,
  },
  author: {
    fontSize: 22,
    fontWeight: "500",
    color: "#596064",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F0F4F7",
  },
  ratingPillText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2C3437",
  },
  reviewCount: {
    fontSize: 14,
    fontWeight: "500",
    color: "#596064",
  },
  metaGrid: {
    flexDirection: "row",
    gap: 14,
  },
  metaCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  metaLabel: {
    fontSize: 11,
    color: "#596064",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "800",
    color: "#2C3437",
  },
  stockText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#16A34A",
  },
  stockTextSoldOut: {
    color: "#A83836",
  },
  inlineActionBar: {
    marginTop: 28,
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  descriptionShell: {
    marginTop: 32,
  },
  descriptionSection: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: "#F0F4F7",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2C3437",
    letterSpacing: -0.4,
  },
  descriptionText: {
    marginTop: 18,
    fontSize: 15,
    lineHeight: 26,
    color: "#596064",
  },
  reviewSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  reviewSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#005CC1",
  },
  reviewList: {
    marginTop: 24,
    gap: 16,
  },
  reviewCard: {
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(172,179,183,0.18)",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  reviewerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewerMeta: {
    justifyContent: "center",
  },
  reviewerAvatarText: {
    fontSize: 14,
    fontWeight: "800",
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#2C3437",
  },
  reviewTime: {
    marginTop: 2,
    fontSize: 12,
    color: "#596064",
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
  },
  reviewContent: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 24,
    color: "#596064",
    fontStyle: "italic",
  },
  addToCartButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#005CC1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addToCartButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#005CC1",
  },
  disabledOutlineButton: {
    opacity: 0.45,
  },
  buyNowButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#005CC1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#005CC1",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  disabledBuyButton: {
    opacity: 0.55,
  },
  buyNowButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F9F8FF",
  },
});
