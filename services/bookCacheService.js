import { getBookById } from "./bookService";

const cache = new Map();

export const getBookCached = async (id) => {
  if (cache.has(id)) 
    return cache.get(id);

  const book = await getBookById(id);
  cache.set(id, book);

  return book;
};