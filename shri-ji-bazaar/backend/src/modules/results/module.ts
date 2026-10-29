import { Router } from 'express';
import { ResultsController } from './controllers/results.controller';
import { ResultsService } from './services/results.service';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class ResultsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const service = new ResultsService();
    // Public router: no adminOnly flag, so game-scoped declare is not exposed here.
    new ResultsController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    // Admin router: flag true exposes the admin-only game-scoped declare route.
    new ResultsController(service, this.adminRouter, true);
  }
}
