import { Router } from 'express';
import { ResultsController } from './controllers/results.controller';
import { ResultsService } from './services/results.service';
import { ResultsRepository } from './repositories/results.repository';

export class ResultsModule {
  public router = Router();
  constructor() {
    const service = new ResultsService();
    const controller = new ResultsController(service, this.router);
  }
}
