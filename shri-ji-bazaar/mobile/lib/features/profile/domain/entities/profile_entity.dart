class ProfileEntity {
  final String id;
  final String name;
  final String mobile;
  final String? email;
  final String? avatar;
  final int points;
  final String referralCode;
  final String? referredBy;
  final String status;
  final DateTime? lastLogin;
  final DateTime createdAt;
  final DateTime updatedAt;

  ProfileEntity({
    required this.id,
    required this.name,
    required this.mobile,
    this.email,
    this.avatar,
    this.points = 0,
    required this.referralCode,
    this.referredBy,
    required this.status,
    this.lastLogin,
    required this.createdAt,
    required this.updatedAt,
  });

  ProfileEntity copyWith({
    String? name,
    String? email,
    String? avatar,
    int? points,
  }) {
    return ProfileEntity(
      id: id,
      name: name ?? this.name,
      mobile: mobile,
      email: email ?? this.email,
      avatar: avatar ?? this.avatar,
      points: points ?? this.points,
      referralCode: referralCode,
      referredBy: referredBy,
      status: status,
      lastLogin: lastLogin,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }
}
