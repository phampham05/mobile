import api from "./api";
import { getBookById } from "./bookService";

/**
 * Lấy giỏ hàng của người dùng
 * GET /cart
 */
export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data;
};

/**
 * Lấy giỏ hàng kèm thông tin chi tiết của sách
 */
export const getCartWithBookDetails = async () => {
  try {
    const cartItems = await getCart();

    // Gọi song song API chi tiết sách
    const cartWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const book = await getBookById(item.bookId);
          return {
            ...item,
            book,
          };
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết sách:", error);
          return { ...item, book: null };
        }
      })
    );

    return cartWithDetails;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    throw error;
  }
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * POST /cart
 */
export const addToCart = async (bookId, quantity) => {
  const response = await api.post("/cart", {
    bookId,
    quantity,
  });
  return response.data;
};

/**
 * Cập nhật số lượng sản phẩm
 * PUT /cart/{id}
 */
export const updateCartItem = async (id, quantity) => {
  const response = await api.put(`/cart/${id}`, { quantity });
  return response.data;
};

/**
 * Xóa sản phẩm khỏi giỏ hàng
 * DELETE /cart/{id}
 */
export const removeCartItem = async (id) => {
  return await api.delete(`/cart/${id}`);
};

/**
 * Xóa toàn bộ giỏ hàng
 * DELETE /cart/clear
 */
export const clearCart = async () => {
  return await api.delete("/cart/clear");
};