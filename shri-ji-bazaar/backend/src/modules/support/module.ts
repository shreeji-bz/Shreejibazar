import { Router } from 'express';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';
import { SupportRepository } from './repositories/support.repository';

export class SupportModule {
  public router = Router();
  public adminRouter = Router();
  constructor() {
    const repository = new SupportRepository();
    const service = new SupportService(repository);
    new SupportController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new SupportController(service, this.adminRouter);
  }
}
