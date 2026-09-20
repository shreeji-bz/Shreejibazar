import { Request, Response } from 'express';
import { Router } from 'express';
import { AdminService } from '../services/admin.service';

export class AdminController {
  public publicRouter = Router();
  public protectedRouter = Router();

  constructor(private adminService: AdminService) {
    // Public routes (no auth required)
    this.publicRouter.post('/login', this.login.bind(this));

    // Protected routes (require admin auth)
    this.protectedRouter.get('/dashboard', this.getDashboard.bind(this));
    this.protectedRouter.get('/audit-logs', this.getAuditLogs.bind(this));
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.adminService.login(req.body.email, req.body.password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const stats = await this.adminService.getDashboard();
      res.json({ success: true, data: stats });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }

  async getAuditLogs(req: Request, res: Response) {
    try {
      const data = await this.adminService.getAuditLogs(req.query);
      res.json({ success: true, data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
}
