import { Router } from 'express';
import { AdminController } from './controllers/admin.controller';
import { AdminService } from './services/admin.service';
import { AdminRepository } from './repositories/admin.repository';

export class AdminModule {
  public publicRouter = Router();
  public protectedRouter = Router();

  constructor() {
    const repository = new AdminRepository();
    const service = new AdminService(repository);
    const controller = new AdminController(service);
    this.publicRouter.use(controller.publicRouter);
    this.protectedRouter.use(controller.protectedRouter);
  }
}
