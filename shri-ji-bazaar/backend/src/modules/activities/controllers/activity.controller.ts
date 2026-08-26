import { Request, Response } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  constructor(private activityService: ActivityService, private router: any) {
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get('/', this.getAll.bind(this));
    this.router.get('/:id', this.getById.bind(this));
  }
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = await this.activityService.findAll(userId, req.query);
      res.json({ success: true, ...data });
    } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
  }
  async getById(req: Request, res: Response) {
    try {
      const data = await this.activityService.findById(req.params.id);
      res.json({ success: true, data });
    } catch (error: any) { res.status(404).json({ success: false, message: error.message }); }
  }
}
