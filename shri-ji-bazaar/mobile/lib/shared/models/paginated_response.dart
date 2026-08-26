class PaginatedResponse<T> {
  final List<T> data;
  final int total;
  final int page;
  final int limit;

  PaginatedResponse({required this.data, required this.total, required this.page, required this.limit});

  bool get hasMore => page * limit < total;
}
