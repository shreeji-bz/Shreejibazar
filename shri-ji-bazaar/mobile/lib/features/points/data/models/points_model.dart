import '../../domain/entities/points_entity.dart';

class PointsModel extends PointsEntity {
  PointsModel({
    required super.id,
    required super.balance,
    required super.totalEarned,
    required super.totalSpent,
    super.transactions = const [],
  });

  factory PointsModel.fromJson(Map<String, dynamic> json) {
    return PointsModel(
      id: json['id'] as String,
      balance: json['balance'] as int,
      totalEarned: json['total_earned'] as int? ?? 0,
      totalSpent: json['total_spent'] as int? ?? 0,
    );
  }
}

class PointTransactionModel extends PointTransactionEntity {
  PointTransactionModel({
    required super.id,
    required super.userId,
    required super.type,
    required super.amount,
    required super.description,
    super.referenceId,
    super.referenceType,
    required super.balanceAfter,
    required super.createdAt,
  });

  factory PointTransactionModel.fromJson(Map<String, dynamic> json) {
    return PointTransactionModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: json['type'] as String,
      amount: json['amount'] as int,
      description: json['description'] as String,
      referenceId: json['reference_id'] as String?,
      referenceType: json['reference_type'] as String?,
      balanceAfter: json['balance_after'] as int,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
