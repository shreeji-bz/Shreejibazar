import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class UsersModule {
  public router = Router();
  /** Admin management routes (list/search/status) — requires an admin token. */
  public adminRouter = Router();
  constructor() {
    const repository = new UsersRepository();
    const service = new UsersService(repository);
    new UsersController(service, this.router);
    this.adminRouter.use(authenticateAdmin);
    new UsersController(service, this.adminRouter);
  }
}
