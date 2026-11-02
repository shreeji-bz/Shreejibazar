import { Router, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  constructor(private authService: AuthService, private router: Router) {}

  initializeRoutes() {
    this.router.post('/register', this.register.bind(this));
    this.router.post('/login', this.login.bind(this));
    this.router.post('/otp/request', this.requestOtp.bind(this));
    this.router.post('/otp/verify', this.verifyOtp.bind(this));
    this.router.post('/refresh', this.refreshToken.bind(this));
    this.router.post('/logout', this.logout.bind(this));
    this.router.post('/forgot-password', this.forgotPassword.bind(this));
    this.router.post('/reset-password', this.resetPassword.bind(this));
  }

  async register(req: Request, res: Response) {
    try {
      const { allowRegistration } = (req as any).appSettings || {};
      if (allowRegistration === 'false') {
        res.status(403).json({ success: false, message: 'Registration is currently disabled', code: 'REGISTRATION_DISABLED' });
        return;
      }
      const result = await this.authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      console.error('Register error:', error);
      res.status(status).json({ success: false, message: error.message || 'Registration failed', code: error.code, details: error.details || null });
    }
  }

  async login(req: Request, res: Response) {
    try {
      // Unified identifier: mobile number OR email address.
      const identifier = req.body.mobile || req.body.identifier || req.body.email;
      const result = await this.authService.login(identifier, req.body.password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Login failed', code: error.code });
    }
  }

  /**
   * OTP login (dev-mode delivery): generates a 6-digit code for the user and
   * returns it in the response (NO delay, NO external provider) so the app
   * can show it on screen and verify it instantly. Swappable with a real
   * SMS/email provider later.
   */
  async requestOtp(req: Request, res: Response) {
    try {
      const identifier = req.body.mobile || req.body.identifier || req.body.email;
      const result = await this.authService.requestOtp(identifier);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'Failed to generate OTP', code: error.code });
    }
  }

  /** Verify the OTP and get session tokens. */
  async verifyOtp(req: Request, res: Response) {
    try {
      const identifier = req.body.mobile || req.body.identifier || req.body.email;
      const result = await this.authService.verifyOtp(identifier, req.body.otp);
      res.json({ success: true, data: result });
    } catch (error: any) {
      const status = error.statusCode || 500;
      res.status(status).json({ success: false, message: error.message || 'OTP verification failed', code: error.code });
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
