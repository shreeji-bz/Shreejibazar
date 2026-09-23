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
    if (!_shouldRetry(err)) {
      handler.next(err);
      return;
    }

    final attempts = retryDelays.length;
    for (var i = 0; i < attempts; i++) {
      final delay = retryDelays[i];
      await Future.delayed(delay);
      try {
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (_) {
        // fall through and retry or fail
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
    if (err.response?.statusCode == 503) {
      final data = err.response?.data;
      if (data is Map && data['code'] == 'MAINTENANCE_MODE') {
        return false;
      }
      return true;
    }
    return false;
  }
}
