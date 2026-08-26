class PointsEntity {
  final String id;
  final int balance;
  final int totalEarned;
  final int totalSpent;
  final List<PointTransactionEntity> transactions;

  PointsEntity({
    required this.id,
    required this.balance,
    required this.totalEarned,
    required this.totalSpent,
    required this.transactions,
  });
}

class PointTransactionEntity {
  final String id;
  final String type;
  final int amount;
  final int balanceBefore;
  final int balanceAfter;
  final String? referenceId;
  final String? referenceType;
  final String description;
  final DateTime createdAt;

  PointTransactionEntity({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceBefore,
    required this.balanceAfter,
    this.referenceId,
    this.referenceType,
    required this.description,
    required this.createdAt,
  });
}
