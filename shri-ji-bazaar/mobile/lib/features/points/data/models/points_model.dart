import '../../domain/entities/points_entity.dart';

class PointsModel extends PointsEntity {
  PointsModel({
    required super.id,
    required super.balance,
    required super.totalEarned,
    required super.totalSpent,
    required super.transactions,
  });

  factory PointsModel.fromJson(Map<String, dynamic> json) {
    final txList = json['transactions'] as List<dynamic>? ?? [];
    return PointsModel(
      id: json['id'] as String,
      balance: json['balance'] as int,
      totalEarned: json['total_earned'] as int? ?? 0,
      totalSpent: json['total_spent'] as int? ?? 0,
      transactions: txList.map((t) => PointTransactionModel.fromJson(t)).toList(),
    );
  }
}

class PointTransactionModel extends PointTransactionEntity {
  PointTransactionModel({
    required super.id,
    required super.type,
    required super.amount,
    required super.balanceBefore,
    required super.balanceAfter,
    super.referenceId,
    super.referenceType,
    required super.description,
    required super.createdAt,
  });

  factory PointTransactionModel.fromJson(Map<String, dynamic> json) {
    return PointTransactionModel(
      id: json['id'] as String,
      type: json['type'] as String,
      amount: json['amount'] as int,
      balanceBefore: json['balance_before'] as int,
      balanceAfter: json['balance_after'] as int,
      referenceId: json['reference_id'] as String?,
      referenceType: json['reference_type'] as String?,
      description: json['description'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
