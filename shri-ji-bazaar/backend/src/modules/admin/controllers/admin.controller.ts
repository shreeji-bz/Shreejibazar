import { Request, Response } from 'express';
import { Router } from 'express';
import { AdminService } from '../services/admin.service';
import { StaffService } from '../services/staff.service';

export class AdminController {
  public publicRouter = Router();
  public protectedRouter = Router();

  constructor(private adminService: AdminService) {
    // Public routes (no auth required)
    this.publicRouter.post('/login', this.login.bind(this));

    // Protected routes (require admin auth)
    this.protectedRouter.get('/dashboard', this.getDashboard.bind(this));
    this.protectedRouter.get('/audit-logs', this.getAuditLogs.bind(this));

    // Staff management routes
    const staffService = new StaffService();
    this.protectedRouter.get('/staff', (req, res) => this.getAllStaff(req, res, staffService));
    this.protectedRouter.get('/staff/:id', (req, res) => this.getStaffById(req, res, staffService));
    this.protectedRouter.post('/staff', (req, res) => this.createStaff(req, res, staffService));
    this.protectedRouter.patch('/staff/:id', (req, res) => this.updateStaff(req, res, staffService));
    this.protectedRouter.delete('/staff/:id', (req, res) => this.deleteStaff(req, res, staffService));
    this.protectedRouter.patch('/staff/:id/toggle-status', (req, res) => this.toggleStaffStatus(req, res, staffService));
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

  // Staff management handlers
  async getAllStaff(_req: Request, res: Response, staffService: StaffService) {
    try {
      const staff = await staffService.getAllStaff();
      res.json({ success: true, data: staff });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }

  async getStaffById(req: Request, res: Response, staffService: StaffService) {
    try {
      const staff = await staffService.getStaffById(req.params.id);
      if (!staff) {
        res.status(404).json({ success: false, message: 'Staff member not found' });
        return;
      }
      res.json({ success: true, data: staff });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }

  async createStaff(req: Request, res: Response, staffService: StaffService) {
    try {
      const staff = await staffService.createStaff(req.body);
      res.status(201).json({ success: true, data: staff, message: 'Staff member created successfully' });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }

  async updateStaff(req: Request, res: Response, staffService: StaffService) {
    try {
      const staff = await staffService.updateStaff(req.params.id, req.body);
      res.json({ success: true, data: staff, message: 'Staff member updated successfully' });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }

  async deleteStaff(req: Request, res: Response, staffService: StaffService) {
    try {
      await staffService.deleteStaff(req.params.id);
      res.json({ success: true, message: 'Staff member deleted successfully' });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }

  async toggleStaffStatus(req: Request, res: Response, staffService: StaffService) {
    try {
      // For toggle, we need current status. Simpler approach: fetch then toggle.
      const current = await staffService.getStaffById(req.params.id);
      if (!current) {
        res.status(404).json({ success: false, message: 'Staff member not found' });
        return;
      }
      const staff = await staffService.toggleStaffStatus(req.params.id, current.status);
      res.json({ success: true, data: staff, message: `Staff member ${staff.status === 'active' ? 'activated' : 'deactivated'}` });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
}
