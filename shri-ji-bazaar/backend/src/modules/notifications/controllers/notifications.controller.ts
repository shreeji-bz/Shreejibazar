import { Request, Response } from 'express';
import { supabase } from '../../../config/database.config';

export class NotificationsController {
  private isAdmin: boolean;
  constructor(private router: any, isAdmin = false) {
    this.isAdmin = isAdmin;
    this.initializeRoutes();
  }

  initializeRoutes() {
    if (this.isAdmin) {
      this.router.get('/', this.listAllNotifications.bind(this));
      this.router.post('/send', this.sendNotification.bind(this));
      this.router.patch('/mark-all-read', this.markAllRead.bind(this));
      this.router.delete('/:id', this.deleteNotification.bind(this));
    } else {
      this.router.get('/', this.getUserNotifications.bind(this));
      this.router.get('/unread-count', this.getUnreadCount.bind(this));
      this.router.patch('/:id/read', this.markAsRead.bind(this));
      this.router.patch('/mark-all-read', this.markAllAsRead.bind(this));
      this.router.patch('/read-all', this.markAllAsRead.bind(this));
      this.router.post('/send', this.sendNotification.bind(this));
    }
  }

  async listAllNotifications(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, count } = await supabase
        .from('notifications')
        .select('*, users(name, mobile)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      const rows = (data || []).map((row: any) => ({
        ...row,
        user_name: row.users?.name,
        user_mobile: row.users?.mobile,
      }));

      res.json({
        success: true,
        data: rows,
        meta: { total: count || 0, page, limit, totalPages: Math.ceil((count || 0) / limit) },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      await supabase.from('notifications').delete().eq('id', req.params.id);
      res.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async markAllRead(req: Request, res: Response) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      res.json({ success: true, message: 'All marked as read' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
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
      await supabase.from('notifications').update({ is_read: true }).eq('id', req.params.id);
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
        .update({ is_read: true })
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

      // Live notifications.user_id is NOT NULL and there is no `data` column.
      // A broadcast therefore fans out to every user; no null-user_id row.
      let targetIds: string[] = userIds && userIds.length ? userIds : [];
      if (target === 'all') {
        const { data: allUsers, error: uerr } = await supabase.from('users').select('id');
        if (uerr) throw new Error(uerr.message);
        targetIds = (allUsers || []).map((u: any) => u.id);
      }

      let sent = 0;
      for (const uid of targetIds) {
        const { error } = await supabase.from('notifications').insert({
          user_id: uid,
          title,
          message,
          type: type || 'info',
        });
        if (error) throw new Error(error.message);
        sent += 1;
      }

      const { io } = require('../../../config/websocket.config');
      if (io) {
        io.emit('notification:new', { title, message, type });
      }

      res.json({ success: true, message: 'Notification sent', sent });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
