const { PAGINATION } = require('./constants');

const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
  );
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

const getPaginationMeta = (total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
};

const paginatedResponse = (data, total, page, limit) => {
  return {
    success: true,
    data,
    pagination: getPaginationMeta(total, page, limit),
  };
};

module.exports = {
  getPagination,
  getPaginationMeta,
  paginatedResponse,
};
