import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../../config/database.config';
import { config } from '../../config/app.config';
import { AppError } from '../../common/utils/error.util';

export interface AuthUser {
  id: string;
  email: string;
  mobile: string;
  name: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized', code: 'NO_TOKEN' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    // Try user token first (has userId)
    if (decoded.userId) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, mobile, name, status')
        .eq('id', decoded.userId)
        .single();

      if (error || !user) {
        if (error) {
          console.error('Auth middleware users select error:', JSON.stringify(error));
        }
        res.status(401).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        name: user.name,
        role: 'user',
      };
      next();
      return;
    }

    // Try admin token (has adminId)
    if (decoded.adminId) {
      const { data: admin, error } = await supabase
        .from('admins')
        .select('id, email, name, role, status')
        .eq('id', decoded.adminId)
        .single();

      if (error || !admin) {
        if (error) {
          console.error('Auth middleware admins select error:', JSON.stringify(error));
        }
        res.status(401).json({ success: false, message: 'Admin not found', code: 'ADMIN_NOT_FOUND' });
        return;
      }

      if (admin.status !== 'active') {
        res.status(403).json({ success: false, message: 'Admin account is inactive', code: 'ADMIN_INACTIVE' });
        return;
      }

      req.user = {
        id: admin.id,
        email: admin.email,
        mobile: '',
        name: admin.name,
        role: admin.role,
      };
      next();
      return;
    }

    res.status(401).json({ success: false, message: 'Invalid token', code: 'INVALID_TOKEN' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    if (decoded.userId) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, mobile, name, status')
        .eq('id', decoded.userId)
        .single();

      if (user) {
        req.user = { id: user.id, email: user.email, mobile: user.mobile, name: user.name, role: 'user' };
      }
    } else if (decoded.adminId) {
      const { data: admin } = await supabase
        .from('admins')
        .select('id, email, name, role')
        .eq('id', decoded.adminId)
        .single();

      if (admin) {
        req.user = { id: admin.id, email: admin.email, mobile: '', name: admin.name, role: admin.role };
      }
    }
    next();
  } catch {
    next();
  }
};
