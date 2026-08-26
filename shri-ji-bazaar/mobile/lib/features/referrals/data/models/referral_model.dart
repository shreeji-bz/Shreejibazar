import '../../domain/entities/referral_entity.dart';

class ReferralModel extends ReferralEntity {
  ReferralModel({
    required super.id,
    required super.referrerId,
    required super.referrerName,
    required super.referredUserId,
    required super.referredUserName,
    required super.points,
    required super.status,
    required super.createdAt,
  });

  factory ReferralModel.fromJson(Map<String, dynamic> json) {
    return ReferralModel(
      id: json['id'] as String,
      referrerId: json['referrer_id'] as String,
      referrerName: json['referrer_name'] as String,
      referredUserId: json['referred_user_id'] as String,
      referredUserName: json['referred_user_name'] as String,
      points: json['points'] as int,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}

class ReferralStatsModel extends ReferralStatsEntity {
  ReferralStatsModel({
    required super.totalReferrals,
    required super.completedReferrals,
    required super.totalPointsEarned,
    required super.referrals,
  });

  factory ReferralStatsModel.fromJson(Map<String, dynamic> json) {
    final referralsList = json['referrals'] as List<dynamic>? ?? [];
    return ReferralStatsModel(
      totalReferrals: json['total_referrals'] as int? ?? 0,
      completedReferrals: json['completed_referrals'] as int? ?? 0,
      totalPointsEarned: json['total_points_earned'] as int? ?? 0,
      referrals: referralsList.map((r) => ReferralModel.fromJson(r)).toList(),
    );
  }
}
