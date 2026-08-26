import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  constructor(private notificationService: NotificationService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/unread-count', this.getUnreadCount.bind(this));
    this.router.patch('/:id/read', this.markAsRead.bind(this));
    this.router.patch('/read-all', this.markAllAsRead.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.notificationService.getUserNotifications(userId, req.query);
      res.json({ success: true, ...data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async markAsRead(req: Request, res: Response) {
    try {
      await this.notificationService.markAsRead(req.params.id);
      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
  }
  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      await this.notificationService.markAllAsRead(userId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
}
