import { Router } from 'express';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationsService } from './services/notifications.service';
import { NotificationsRepository } from './repositories/notifications.repository';

export class NotificationsModule {
  public router = Router();
  constructor() {
    const controller = new NotificationsController(this.router);
  }
}
