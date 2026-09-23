import 'dart:async';
import 'package:flutter/foundation.dart';
import '../../domain/usecases/get_results.dart';
import '../../domain/entities/result_entity.dart';

class ResultController extends ChangeNotifier {
  final GetResults getResults;

  List<ResultEntity> _results = [];
  bool _isLoading = false;
  String? _errorMessage;

  ResultController(this.getResults);

  List<ResultEntity> get results => List.unmodifiable(_results);
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> loadResults() async {
    if (_isLoading) return;

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await getResults(limit: 100);
      _results = results;
      _errorMessage = null;
    } catch (e) {
      _results = [];
      _errorMessage = e.toString().replaceFirst('Exception: ', '');
      debugPrint('Failed to load results: $_errorMessage');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
