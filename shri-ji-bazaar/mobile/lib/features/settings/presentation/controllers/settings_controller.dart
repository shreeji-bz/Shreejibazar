import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_settings.dart';

class SettingsController extends ChangeNotifier {
  final GetSettings getSettings;
  SettingsController(this.getSettings);
}
