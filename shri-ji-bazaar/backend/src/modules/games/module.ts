import { Router } from 'express';
import { GamesController } from './controllers/games.controller';
import { GamesService } from './services/games.service';
import { GameRepository } from './repositories/games.repository';

export class GamesModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const repository = new GameRepository();
    const service = new GamesService(repository);

    // User-facing routes
    new GamesController(service, this.router);

    // Admin routes
    new GamesController(service, this.adminRouter);
  }
}
