import { Router } from 'express';
import { NotificationsController } from './controllers/notifications.controller';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';

export class NotificationsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    // User-facing routes (authenticated)
    new NotificationsController(this.router, false);
    // Admin routes
    this.adminRouter.use(authenticateAdmin);
    new NotificationsController(this.adminRouter, true);
  }
}
