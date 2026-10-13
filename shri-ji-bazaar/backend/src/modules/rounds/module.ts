import { Router } from 'express';
import { RoundsController } from './controllers/rounds.controller';
import { RoundsService } from './services/rounds.service';
import { RoundsRepository } from './repositories/rounds.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class RoundsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const repository = new RoundsRepository();
    const service = new RoundsService(repository);
    new RoundsController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new RoundsController(service, this.adminRouter);
  }
}
