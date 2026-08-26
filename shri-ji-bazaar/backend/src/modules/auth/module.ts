import { Router } from 'express';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repositories/auth.repository';

export class AuthModule {
  public router = Router();

  constructor() {
    const authRepository = new AuthRepository();
    const authService = new AuthService(authRepository);
    const controller = new AuthController(authService, this.router);
    controller.initializeRoutes();
  }
}
