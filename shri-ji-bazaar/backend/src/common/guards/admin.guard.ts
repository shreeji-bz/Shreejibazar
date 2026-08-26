import { Request, Response, NextFunction } from 'express';
import { authGuard } from './auth.guard';

export function adminGuard(req: Request, res: Response, next: NextFunction) {
  authGuard(req, res, () => {
    if (req.body.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  });
}
