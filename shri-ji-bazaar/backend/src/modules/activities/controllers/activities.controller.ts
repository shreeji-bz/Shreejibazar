import { Request, Response } from 'express';
import { ActivitiesService } from '../services/activities.service';
import { supabase } from '../../../config/database.config';

export class ActivitiesController {
  private isAdmin: boolean;
  constructor(private activitiesService: ActivitiesService, private router: any, isAdmin = false) {
    this.isAdmin = isAdmin;
    this.initializeRoutes();
  }

  initializeRoutes() {
    if (this.isAdmin) {
      this.router.get('/', this.getAllActivities.bind(this));
      this.router.post('/log', this.logActivity.bind(this));
    } else {
      this.router.get('/', this.getUserActivities.bind(this));
      this.router.post('/log', this.logActivity.bind(this));
    }
  }

  async getUserActivities(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const result = await this.activitiesService.getUserActivities(userId, req.query);
      res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async logActivity(req: Request, res: Response) {
    try {
      const { userId, gameId, roundId, activityType, description, pointsChange, metadata } = req.body;
      const data = await this.activitiesService.logActivity({
        userId, gameId, roundId, activityType, description, pointsChange, metadata,
      });
      res.status(201).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAllActivities(req: Request, res: Response) {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('activities')
        .select('*, users(name, mobile), games(name), rounds(round_number)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);
      if (req.query.userId) query = query.eq('user_id', req.query.userId as string);
      if (req.query.gameId) query = query.eq('game_id', req.query.gameId as string);
      const { data, count } = await query;

      const rows = (data || []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        userName: row.users?.name || 'Unknown',
        userMobile: row.users?.mobile || '',
        gameId: row.game_id,
        gameName: row.games?.name || 'Unknown',
        roundId: row.round_id,
        roundNumber: row.rounds?.round_number,
        activityType: row.activity_type,
        description: row.description,
        pointsChange: row.points_change,
        status: row.status,
        metadata: row.metadata,
        createdAt: row.created_at,
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
}
