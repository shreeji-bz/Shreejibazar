import '../entities/wager_entity.dart';
import '../repositories/iwager_repository.dart';

class GetWagerHistory {
  final IWagerRepository repository;

  GetWagerHistory(this.repository);

  Future<WagerListResponse> execute({int page = 1, int limit = 20}) {
    return repository.getWagerHistory(page: page, limit: limit);
  }
}
