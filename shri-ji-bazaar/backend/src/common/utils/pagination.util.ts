export function getPagination(req: { query: { page?: string; limit?: string } }) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  return { page, limit, offset: (page - 1) * limit };
}
