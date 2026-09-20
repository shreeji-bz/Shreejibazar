import 'dart:async';
import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  RetryInterceptor({
    this.retries = 3,
    this.retryDelays = const [Duration(seconds: 1), Duration(seconds: 2), Duration(seconds: 4)],
  });

  final int retries;
  final List<Duration> retryDelays;

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (_shouldRetry(err) && retryDelays.isNotEmpty) {
      final delay = retryDelays.first;
      final remainingDelays = List<Duration>.from(retryDelays);
      remainingDelays.removeAt(0);
      await Future.delayed(delay);
      try {
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (_) {
        // fall through to next handler
      }
    }
    handler.next(err);
  }

  bool _shouldRetry(DioException err) {
    if (err.type == DioExceptionType.connectionError) return true;
    if (err.type == DioExceptionType.connectionTimeout) return true;
    if (err.type == DioExceptionType.sendTimeout) return true;
    if (err.type == DioExceptionType.receiveTimeout) return true;
    if (err.type == DioExceptionType.unknown) return true;
    if (err.response?.statusCode == 500) return true;
    if (err.response?.statusCode == 502) return true;
    if (err.response?.statusCode == 503) return true;
    return false;
  }
}
