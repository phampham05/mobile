import api from "./api";

const resolvePayload = (response) => response?.data?.result ?? response?.data ?? {};

export const getBooks = async (params = {}) => {
  const response = await api.get("/books", { params });
  const payload = resolvePayload(response);

  if (Array.isArray(payload)) {
    return {
      items: payload,
      page: 0,
      size: payload.length,
      totalElements: payload.length,
      totalPages: 1,
    };
  }

  if (Array.isArray(payload?.content)) {
    return {
      items: payload.content,
      page: payload?.page ?? 0,
      size: payload?.size ?? payload.content.length,
      totalElements: payload?.totalElements ?? payload.content.length,
      totalPages: payload?.totalPages ?? 1,
    };
  }

  return {
    items: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0,
  };
};

export const getBookById = async (bookId) => {
  const response = await api.get(`/books/${bookId}`);
  return resolvePayload(response);
};
