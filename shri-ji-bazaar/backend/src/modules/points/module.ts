/**
 * Shri Ji Bazaar - Points Module
 */

import { Router } from 'express';
import { PointsController } from './controllers/points.controller';
import { PointsService } from './services/points.service';
import { PointsRepository } from './repositories/points.repository';

export class PointsModule {
  public router = Router();

  constructor() {
    const repository = new PointsRepository();
    const service = new PointsService(repository);
    const controller = new PointsController(service);
    this.router.use('/', controller.getRouter());
  }
}
