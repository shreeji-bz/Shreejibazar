class SplashRepository implements ISplashRepository {
  final SplashDatasource _datasource;

  SplashRepository(this._datasource);

  @override
  Future<SplashEntity> checkAppStatus() async {
    return await _datasource.checkAppStatus();
  }
}
