class AppException implements Exception {
  final String message;
  final String? code;

  AppException(this.message, {this.code});

  @override
  String toString() => message;
}

class ApiException extends AppException {
  final int? statusCode;

  ApiException(String message, {this.statusCode, String? code})
      : super(message, code: code);
}

class NetworkException extends AppException {
  NetworkException() : super('No internet connection');
}

class ServerException extends AppException {
  ServerException(String message) : super(message);
}

class UnauthorizedException extends AppException {
  UnauthorizedException() : super('Unauthorized. Please login again.');
}

class NotFoundException extends AppException {
  NotFoundException(String message) : super(message);
}
