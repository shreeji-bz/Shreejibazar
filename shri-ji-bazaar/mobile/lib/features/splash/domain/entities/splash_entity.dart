class SplashEntity {
  final bool maintenanceMode;
  final String? maintenanceMessage;
  final String latestVersion;
  final bool forceUpdate;
  /// The public APK download URL (admin-managed via Apk Manager).
  final String? apkUrl;
  final String? apkChangelog;

  SplashEntity({
    required this.maintenanceMode,
    this.maintenanceMessage,
    required this.latestVersion,
    required this.forceUpdate,
    this.apkUrl,
    this.apkChangelog,
  });
}
