import { Router } from 'express';
import { WagersController } from './controllers/wagers.controller';
import { AdminWagersController } from './controllers/admin-wagers.controller';
import { WagersService } from './services/wagers.service';
import { WagersRepository } from './repositories/wagers.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';
import { authenticateToken } from '../../common/middleware/auth.middleware';

export class WagersModule {
  public router = Router();
  public adminRouter = Router();
  constructor() {
    const repository = new WagersRepository();
    const service = new WagersService(repository);
    const adminController = new AdminWagersController(service, repository);
    const userController = new WagersController(service, repository, this.router);

    // Admin routes
    this.adminRouter.get('/', adminController.getAllWagers.bind(adminController));
    this.adminRouter.get('/stats', adminController.getWagerStats.bind(adminController));
    this.adminRouter.get('/:id', adminController.getWagerById.bind(adminController));
    this.adminRouter.get('/round/:roundId', adminController.getWagersByRound.bind(adminController));
    this.adminRouter.post('/:id/void', adminController.voidWager.bind(adminController));
    this.adminRouter.post('/round/:roundId/settle', adminController.settleRoundWagers.bind(adminController));

    // User routes
    this.router.use(authenticateToken);
    this.router.get('/', userController.getUserWagers.bind(userController));
    this.router.get('/stats', userController.getWagerStats.bind(userController));
  }
}
