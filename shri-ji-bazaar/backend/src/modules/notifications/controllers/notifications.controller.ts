import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';

export class NotificationsController {
  constructor(private notificationsService: NotificationsService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
    this.router.post('/', this.create.bind(this));
    this.router.post('/bulk', this.createBulk.bind(this));
    this.router.patch('/:id/read', this.markAsRead.bind(this));
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const options = {
        ...req.query,
        userId,
      };
      const result = await this.notificationsService.findAll(options);
      res.json({ success: true, data: result.data, total: result.total });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const data = await this.notificationsService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.notificationsService.create({ ...req.body, userId });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async createBulk(req: Request, res: Response) {
    try {
      const notifications = Array.isArray(req.body) ? req.body : req.body.notifications;
      if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
        res.status(400).json({ success: false, message: 'Notifications array is required and must not be empty' });
        return;
      }
      const data = await this.notificationsService.createBulk(notifications);
      res.status(201).json({ success: true, data, count: data.length });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const result = await this.notificationsService.updateStatus(req.params.id, true);
      res.json({ ...result, message: 'Notification marked as read' });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
}
