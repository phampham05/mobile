import api from "./api";

/**
 * Lấy danh sách sách
 * GET /books
 */
export const getBooks = async () => {
  const response = await api.get("/books");
  return response.data;
};

/**
 * Lấy chi tiết sách theo ID
 * GET /books/{id}
 */
export const getBookById = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return response.data;
};