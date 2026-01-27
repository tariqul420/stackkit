export function getPagination(query: any) {
  const page = Math.max(1, parseInt(String(query.page || "1"), 10) || 1);
  const limit = Math.min(100, parseInt(String(query.limit || "10"), 10) || 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip, take: limit };
}
