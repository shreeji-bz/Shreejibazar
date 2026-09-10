import { Router } from 'express';
import { ActivitiesController } from './controllers/activities.controller';
import { ActivitiesService } from './services/activities.service';
import { ActivitiesRepository } from './repositories/activities.repository';

export class ActivitiesModule {
  public router = Router();
  constructor() {
    const service = new ActivitiesService();
    const controller = new ActivitiesController(service, this.router);
  }
}
