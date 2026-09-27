import { Request, Response } from 'express';
import { ActivitiesService } from '../services/activities.service';

export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService, private router: any) {
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get('/', this.getUserActivities.bind(this));
    this.router.post('/log', this.logActivity.bind(this));
  }

  async getUserActivities(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
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
}
