import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_results.dart';

class ResultController extends ChangeNotifier {
  final GetResults getResults;
  ResultController(this.getResults);
}
