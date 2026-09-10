// Wager feature - clean architecture feature module

// Data layer
export 'data/models/wager_model.dart';
export 'data/datasources/wager_datasource.dart';
export 'data/repositories/wager_repository.dart';

// Domain layer
export 'domain/entities/wager_entity.dart';
export 'domain/repositories/iwager_repository.dart';
export 'domain/usecases/place_wager.dart';
export 'domain/usecases/get_wager_history.dart';

// Presentation layer
export 'presentation/controllers/wager_controller.dart';
export 'presentation/pages/play_page.dart';
export 'presentation/widgets/bet_slip.dart';
