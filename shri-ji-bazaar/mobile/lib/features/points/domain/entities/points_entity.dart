class PointsEntity {
  final String id;
  final int balance;
  final int totalEarned;
  final int totalSpent;
  final List<PointTransactionEntity> transactions;

  PointsEntity({
    required this.id,
    required this.balance,
    this.totalEarned = 0,
    this.totalSpent = 0,
    this.transactions = const [],
  });
}

class PointTransactionEntity {
  final String id;
  final String userId;
  final String type;
  final int amount;
  final String description;
  final String? referenceId;
  final String? referenceType;
  final int balanceAfter;
  final DateTime createdAt;

  PointTransactionEntity({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.description,
    this.referenceId,
    this.referenceType,
    required this.balanceAfter,
    required this.createdAt,
  });
}
