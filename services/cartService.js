import api from "./api";
import { getBookCached } from "./bookCacheService";

const resolvePayload = (response) => response?.data?.result ?? response?.data ?? {};

const normalizeCartItem = (item = {}) => ({
  id: item.id,
  bookId: item.bookId,
  quantity: item.quantity ?? 0,
  price: Number(item.unitPrice ?? item.price ?? 0),
  total: Number(item.lineTotal ?? 0),
  book: {
    id: item.bookId,
    title: item.title ?? "Chưa có tên sách",
    image: item.image ?? null,
    author: item.author ?? "",
    rating: item.rating ?? item.book?.rating ?? 0,
  },
});

export const getCart = async () => {
  const response = await api.get("/cart");
  const payload = resolvePayload(response);

  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    totalItems: payload?.totalItems ?? 0,
    totalQuantity: payload?.totalQuantity ?? 0,
    totalPrice: Number(payload?.totalPrice ?? 0),
  };
};

export const getCartWithBookDetails = async () => {
  try {
    const cart = await getCart();

    const items = await Promise.all(
      cart.items.map(async (item) => {
        try {
          const book = await getBookCached(item.bookId);
          return normalizeCartItem({
            ...item,
            title: book?.title,
            image: book?.image,
            author: book?.author,
            rating: book?.rating,
          });
        } catch (e) {
          console.log("Lỗi lấy book:", e);
          return normalizeCartItem(item);
        }
      })
    );

    return items;
  } catch (error) {
    console.error("Lỗi khi lấy cart kèm book:", error);
    throw error;
  }
};

export const addToCart = async (bookId, quantity) => {
  const response = await api.post("/cart", { bookId, quantity });
  return resolvePayload(response);
};

export const updateCartItem = async (id, quantity) => {
  const response = await api.put(`/cart/${id}`, { quantity });
  return resolvePayload(response);
};

export const removeCartItem = async (id) => {
  const response = await api.delete(`/cart/${id}`);
  return resolvePayload(response);
};

export const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  return resolvePayload(response);
};
