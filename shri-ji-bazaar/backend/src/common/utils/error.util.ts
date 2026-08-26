export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message?: string,
  ) {
    super(message || 'An error occurred');
  }
}

export class NotFoundError extends AppError {
  constructor(message?: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string) {
    super(400, 'BAD_REQUEST', message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message?: string) {
    super(403, 'FORBIDDEN', message);
  }
}
