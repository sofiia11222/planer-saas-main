export type PaginationQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** limit/offset пагинация с безопасными границами */
export function parsePagination(q: PaginationQuery, defaults = { page: 1, limit: 20 }) {
  const page = Math.max(1, Number(q.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || defaults.limit));
  const skip = (page - 1) * limit;
  const sortOrder = q.sortOrder === "asc" ? "asc" : "desc";
  return { page, limit, skip, sortBy: q.sortBy, sortOrder };
}

export function toPaginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}
