import { Router } from 'express';
import { ActivitiesController } from './controllers/activities.controller';
import { ActivitiesService } from './services/activities.service';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class ActivitiesModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const service = new ActivitiesService();
    new ActivitiesController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new ActivitiesController(service, this.adminRouter);
  }
}
