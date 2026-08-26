import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { AppError } from '../../../common/utils/error.util';
import { singleAvatar, handleUploadError } from '../../../common/middleware/upload.middleware';

export class UsersController {
  constructor(private usersService: UsersService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    // Admin endpoints
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.patch('/:id', this.update.bind(this));
    this.router.patch('/:id/status', this.updateStatus.bind(this));

    // Self-service profile endpoints
    this.router.get('/me', this.getMe.bind(this));
    this.router.patch('/me', this.updateMe.bind(this));
    this.router.post('/me/avatar', singleAvatar, this.uploadAvatar.bind(this));
    this.router.post('/me/change-password', this.changePassword.bind(this));
    this.router.delete('/me', this.deleteAccount.bind(this));
  }

  async getAll(req: Request, res: Response) {
    try { const data = await this.usersService.getAll(req.query); res.json({ success: true, ...data }); }
    catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }

  async getById(req: Request, res: Response) {
    try { const data = await this.usersService.getById(req.params.id); res.json({ success: true, data }); }
    catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
  }

  async update(req: Request, res: Response) {
    try { const data = await this.usersService.update(req.params.id, req.body); res.json({ success: true, data }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }

  async updateStatus(req: Request, res: Response) {
    try { await this.usersService.updateStatus(req.params.id, req.body.status); res.json({ success: true, message: 'Status updated' }); }
    catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const data = await this.usersService.getById(req.user.id);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const data = await this.usersService.update(req.user.id, req.body);
      res.json({ success: true, data });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async uploadAvatar(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No avatar file uploaded', code: 'NO_FILE' });
        return;
      }
      const avatarUrl = `/uploads/${req.file.filename}`;
      const data = await this.usersService.update(req.user.id, { avatar: avatarUrl });
      res.json({ success: true, data, avatarUrl });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        res.status(400).json({ success: false, message: 'Current password and new password are required', code: 'MISSING_FIELDS' });
        return;
      }
      if (newPassword.length < 6) {
        res.status(400).json({ success: false, message: 'New password must be at least 6 characters', code: 'WEAK_PASSWORD' });
        return;
      }
      await this.usersService.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message, code: error.code });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const { password } = req.body;
      if (!password) {
        res.status(400).json({ success: false, message: 'Password confirmation required', code: 'MISSING_PASSWORD' });
        return;
      }
      await this.usersService.deleteAccount(req.user.id, password);
      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message, code: error.code });
    }
  }
}
