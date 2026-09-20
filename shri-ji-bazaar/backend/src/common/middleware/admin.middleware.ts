/**
 * Shri Ji Bazaar - Admin Auth Middleware
 * Validates JWT tokens issued to admin users (from admins table)
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/database.config';
import { config } from '../../config/app.config';
import { AppError } from '../../common/utils/error.util';

export interface AdminAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminAuthUser;
    }
  }
}

export const authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Admin authentication required', code: 'NO_TOKEN' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    try {
      // Verify admin still exists in Supabase
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, name, role, status')
        .eq('id', decoded.adminId)
        .single();

      if (error || !admin) {
        res.status(401).json({ success: false, message: 'Admin not found', code: 'ADMIN_NOT_FOUND' });
        return;
      }

      if (admin.status !== 'active') {
        res.status(403).json({ success: false, message: 'Admin account is inactive', code: 'ADMIN_INACTIVE' });
        return;
      }

      req.admin = {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
      next();
    } catch (supabaseError) {
      // Fallback: allow request if we can't reach Supabase in development
      if (config.nodeEnv === 'development' && decoded.adminId) {
        req.admin = {
          id: decoded.adminId,
          email: decoded.email,
          name: decoded.email?.split('@')[0] || 'Admin',
          role: decoded.role || 'admin',
        };
        next();
        return;
      }
      throw supabaseError;
    }
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
};
