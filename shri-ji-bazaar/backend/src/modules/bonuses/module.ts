import { Router } from 'express';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';
import { BonusesController } from './controllers/bonuses.controller';
import { BonusesService } from './services/bonuses.service';
import { BonusesRepository } from './repositories/bonuses.repository';

export class BonusesModule {
  public router = Router();
  public adminRouter = Router();
  constructor() {
    const repository = new BonusesRepository();
    const service = new BonusesService(repository);
    new BonusesController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new BonusesController(service, this.adminRouter);
  }
}
