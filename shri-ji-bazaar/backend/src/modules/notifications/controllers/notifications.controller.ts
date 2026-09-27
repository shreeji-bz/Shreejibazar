import { Request, Response } from 'express';
import { supabase } from '../../../config/database.config';

export class NotificationsController {
  constructor(private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getUserNotifications.bind(this));
    this.router.get('/unread-count', this.getUnreadCount.bind(this));
    this.router.patch('/:id/read', this.markAsRead.bind(this));
    this.router.patch('/mark-all-read', this.markAllAsRead.bind(this));
    this.router.post('/send', this.sendNotification.bind(this));
  }

  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order('created_at', { ascending: false })
        .range(from, to);

      res.json({
        success: true,
        data: data || [],
        meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_read', false);

      res.json({ success: true, count: count || 0 });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      await supabase.from('notifications').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', req.params.id);
      res.json({ success: true, message: 'Marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .or(`user_id.eq.${userId},user_id.is.null`)
        .eq('is_read', false);

      res.json({ success: true, message: 'All marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async sendNotification(req: Request, res: Response) {
    try {
      const { title, message, type, target, userIds } = req.body;

      if (target === 'all') {
        await supabase.from('notifications').insert({
          title,
          message,
          type: type || 'info',
          data: {},
        });
      } else {
        for (const uid of userIds || []) {
          await supabase.from('notifications').insert({
            user_id: uid,
            title,
            message,
            type: type || 'info',
            data: {},
          });
        }
      }

      const { io } = require('../../../config/websocket.config');
      if (io) {
        io.emit('notification:new', { title, message, type });
      }

      res.json({ success: true, message: 'Notification sent' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
