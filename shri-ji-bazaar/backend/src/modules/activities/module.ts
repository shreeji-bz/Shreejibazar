import { Router } from 'express';
import { ActivityController } from './controllers/activity.controller';
import { ActivityService } from './services/activity.service';
import { ActivityRepository } from './repositories/activity.repository';
import { PointsService } from '../points/services/points.service';
import { PointsRepository } from '../points/repositories/points.repository';

export class ActivitiesModule {
  public router = Router();
  constructor() {
    const activityRepo = new ActivityRepository();
    const pointsRepo = new PointsRepository();
    const pointsService = new PointsService(pointsRepo);
    const service = new ActivityService(activityRepo, pointsService);
    const controller = new ActivityController(service, this.router);
  }
}
