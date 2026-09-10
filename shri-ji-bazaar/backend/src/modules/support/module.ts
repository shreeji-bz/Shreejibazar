import { Router } from 'express';
import { SupportController } from './controllers/support.controller';
import { SupportService } from './services/support.service';
import { SupportRepository } from './repositories/support.repository';

export class SupportModule {
  public router = Router();
  constructor() {
    const repository = new SupportRepository();
    const service = new SupportService(repository);
    const controller = new SupportController(service, this.router);
  }
}
