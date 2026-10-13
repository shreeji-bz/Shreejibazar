import { Router } from 'express';
import { ResultsController } from './controllers/results.controller';
import { ResultsService } from './services/results.service';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class ResultsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const service = new ResultsService();
    new ResultsController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new ResultsController(service, this.adminRouter);
  }
}
