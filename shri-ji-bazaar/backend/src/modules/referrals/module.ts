import { Router } from 'express';
import { ReferralsController } from './controllers/referrals.controller';
import { ReferralsService } from './services/referrals.service';
import { ReferralsRepository } from './repositories/referrals.repository';
import { authenticateAdmin } from '../../common/middleware/admin.middleware';
import { authenticateToken } from '../../common/middleware/auth.middleware';

export class ReferralsModule {
  public router = Router();
  public adminRouter = Router();

  constructor() {
    const referralsRepo = new ReferralsRepository();
    const service = new ReferralsService(referralsRepo);

    // User routes
    const userController = new ReferralsController(service, this.router);
    this.router.use(authenticateToken);
    this.router.get('/', userController.getAllReferrals.bind(userController));
    this.router.get('/stats', userController.getStats.bind(userController));
    this.router.get('/list', userController.getList.bind(userController));
    this.router.post('/apply', userController.applyReferral.bind(userController));

    // Admin routes
    const adminController = new ReferralsController(service, this.adminRouter);
    this.adminRouter.use(authenticateAdmin);
    this.adminRouter.get('/', adminController.getAllReferrals.bind(adminController));
    this.adminRouter.get('/stats', adminController.getStats.bind(adminController));
    this.adminRouter.get('/list', adminController.getList.bind(adminController));
  }
}
