import { Router } from 'express';
import { PointsController } from './controllers/points.controller';
import { PointsService } from './services/points.service';
import { PointsRepository } from './repositories/points.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class PointsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const repository = new PointsRepository();
    const service = new PointsService(repository);
    new PointsController(service, repository, this.router);
    this.adminRouter.use(authenticateAdmin);
    new PointsController(service, repository, this.adminRouter, true);
  }
}
