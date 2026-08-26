import { Request, Response, NextFunction } from 'express';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
}
