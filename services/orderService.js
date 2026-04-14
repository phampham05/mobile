import api from "./api";

/**
 * Lấy danh sách đơn hàng của người dùng
 * GET /api/orders
 */
export const getOrders = async () => {
  const response = await api.get("/api/orders");
  return response.data.result;
};

/**
 * Lấy chi tiết đơn hàng
 * GET /api/orders/{orderId}
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data.result;
};

/**
 * Thanh toán đơn hàng
 * POST /api/orders/{orderId}/payment
 */
export const payOrder = async (orderId, payload = {}) => {
  const response = await api.post(
    `/api/orders/${orderId}/payment`,
    payload
  );
  return response.data.result;
};