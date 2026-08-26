import '../../domain/entities/splash_entity.dart';

class SplashModel extends SplashEntity {
  SplashModel({
    required super.maintenanceMode,
    super.maintenanceMessage,
    required super.latestVersion,
    required super.forceUpdate,
  });

  factory SplashModel.fromJson(Map<String, dynamic> json) {
    return SplashModel(
      maintenanceMode: json['maintenance_mode'] as bool? ?? false,
      maintenanceMessage: json['maintenance_message'] as String?,
      latestVersion: json['latest_version'] as String? ?? '1.0.0',
      forceUpdate: json['force_update'] as bool? ?? false,
    );
  }
}
