class ReferralEntity {
  final String id;
  final String referrerId;
  final String referrerName;
  final String referredUserId;
  final String referredUserName;
  final int points;
  final String status;
  final DateTime createdAt;

  ReferralEntity({
    required this.id,
    required this.referrerId,
    required this.referrerName,
    required this.referredUserId,
    required this.referredUserName,
    required this.points,
    required this.status,
    required this.createdAt,
  });
}

class ReferralStatsEntity {
  final int totalReferrals;
  final int completedReferrals;
  final int totalPointsEarned;
  final List<ReferralEntity> referrals;

  ReferralStatsEntity({
    required this.totalReferrals,
    required this.completedReferrals,
    required this.totalPointsEarned,
    required this.referrals,
  });
}
