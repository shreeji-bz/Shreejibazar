class SplashEntity {
  final bool maintenanceMode;
  final String? maintenanceMessage;
  final String latestVersion;
  final bool forceUpdate;

  SplashEntity({
    required this.maintenanceMode,
    this.maintenanceMessage,
    required this.latestVersion,
    required this.forceUpdate,
  });
}
