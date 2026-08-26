import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/app.config';

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.body.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}
