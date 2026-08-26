import { Router } from 'express';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';
import { SupportRepository } from './repositories/support.repository';
import { NotificationService } from '../notifications/services/notification.service';
import { NotificationRepository } from '../notifications/repositories/notification.repository';

export class SupportModule {
  public router = Router();
  constructor() {
    const supportRepo = new SupportRepository();
    const notificationRepo = new NotificationRepository();
    const notificationService = new NotificationService(notificationRepo);
    const service = new SupportService(supportRepo, notificationService);
    const controller = new SupportController(service, this.router);
  }
}
