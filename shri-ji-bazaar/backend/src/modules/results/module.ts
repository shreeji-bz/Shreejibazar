import { Router } from 'express';
import { ResultController } from './controllers/result.controller';
import { ResultsService } from './services/result.service';
import { ResultsRepository } from './repositories/result.repository';

export class ResultsModule {
  public router = Router();

  constructor() {
    const repository = new ResultsRepository();
    const service = new ResultsService(repository);
    const controller = new ResultController(service, this.router);
  }
}
