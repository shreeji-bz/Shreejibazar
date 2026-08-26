import express, { type Express, type Request, type Response, Router } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { config } from './config/app.config';
import { connectRedis } from './config/redis.config';
import { supabase } from './config/database.config';

// Route modules
import { AuthModule } from './modules/auth/module';
import { UsersModule } from './modules/users/module';
import { GamesModule } from './modules/games/module';
import { RoundsModule } from './modules/rounds/module';
import { ResultsModule } from './modules/results/module';
import { ActivitiesModule } from './modules/activities/module';
import { PointsModule } from './modules/points/module';
import { BonusesModule } from './modules/bonuses/module';
import { ReferralsModule } from './modules/referrals/module';
import { NotificationsModule } from './modules/notifications/module';
import { SupportModule } from './modules/support/module';
import { BannersModule } from './modules/banners/module';
import { SettingsModule } from './modules/settings/module';
import { AdminModule } from './modules/admin/module';

// Middleware
import { authenticateToken } from './common/middleware/auth.middleware';
import { authenticateAdmin } from './common/middleware/admin.middleware';
import { errorHandler } from './common/middleware/error.middleware';

dotenv.config();

const app: Express = express();

// Security
app.use(helmet());

// CORS
app.use(cors({ origin: config.cors.origin, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Logging
app.use(morgan('dev'));

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: config.nodeEnv });
});

// API v1 routes
const apiRouter = Router();

// Public routes
const authModule = new AuthModule();
apiRouter.use('/auth', authModule.router);

// Admin routes — login public, others protected
const adminModule = new AdminModule();
apiRouter.use('/admin/auth', adminModule.publicRouter);

// Protected user routes
apiRouter.use('/users', authenticateToken, new UsersModule().router);
apiRouter.use('/games', authenticateToken, new GamesModule().router);
apiRouter.use('/rounds', authenticateToken, new RoundsModule().router);
apiRouter.use('/results', authenticateToken, new ResultsModule().router);
apiRouter.use('/activities', authenticateToken, new ActivitiesModule().router);
apiRouter.use('/points', authenticateToken, new PointsModule().router);
apiRouter.use('/bonuses', authenticateToken, new BonusesModule().router);
apiRouter.use('/referrals', authenticateToken, new ReferralsModule().router);
apiRouter.use('/notifications', authenticateToken, new NotificationsModule().router);
apiRouter.use('/support', authenticateToken, new SupportModule().router);
apiRouter.use('/banners', authenticateToken, new BannersModule().router);
apiRouter.use('/settings', authenticateToken, new SettingsModule().router);

// Admin protected routes (require admin JWT)
apiRouter.use('/admin', authenticateAdmin, adminModule.protectedRouter);

app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
