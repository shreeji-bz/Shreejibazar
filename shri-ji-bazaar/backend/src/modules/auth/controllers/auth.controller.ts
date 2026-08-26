import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private authService: AuthService, private router: Router) {}

  initializeRoutes() {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/refresh', this.refreshToken.bind(this));
    this.router.post('/logout', this.logout.bind(this));
    this.router.post('/forgot-password', this.forgotPassword.bind(this));
    this.router.post('/reset-password', this.resetPassword.bind(this));
  }

  async register(req: Request, res: Response) {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Registration failed', code: error.code });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.authService.login(req.body.mobile, req.body.password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Login failed', code: error.code });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const result = await this.authService.refreshToken(req.body.refreshToken);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Token refresh failed', code: error.code });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      await this.authService.logout(req.body.userId);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await this.authService.forgotPassword(req.body.mobile);
      res.json({ success: true, ...result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to process request', code: error.code });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const result = await this.authService.resetPassword(req.body.mobile, req.body.resetCode, req.body.newPassword);
      res.json({ success: true, ...result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Password reset failed', code: error.code });
    }
  }
}
