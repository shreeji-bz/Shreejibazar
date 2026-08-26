import { Router } from 'express';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';

export class UsersModule {
  public router = Router();
  constructor() {
    const repository = new UsersRepository();
    const service = new UsersService(repository);
    const controller = new UsersController(service, this.router);
  }
}
