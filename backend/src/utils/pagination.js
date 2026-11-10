/*
   ?page=2&limit=20 for list endpoints.
  Bad or missing values fall back to the defaults instead of causing an error.
*/
export function parsePagination(query = {}, { defaultLimit = 20, maxLimit = 50 } = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPagination({ page, limit }, total) {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total
  };
}
