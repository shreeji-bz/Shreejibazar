class GameDetailRepository implements IGameDetailRepository {
  final GameDetailDatasource _datasource;

  GameDetailRepository(this._datasource);

  @override
  Future<GameDetailEntity> getGameDetail(String gameId) async {
    return await _datasource.getGameDetail(gameId);
  }
}
