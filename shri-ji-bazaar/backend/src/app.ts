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
import { WagersModule } from './modules/wagers/module';
import { PaymentsModule } from './modules/payments/module';
import { SettlementsModule } from './modules/settlements/module';

// Middleware
import { authenticateToken } from './common/middleware/auth.middleware';
import { authenticateAdmin } from './common/middleware/admin.middleware';
import { errorHandler } from './common/middleware/error.middleware';
import { settingsMiddleware } from './common/middleware/settings.middleware';

dotenv.config();

const app: Express = express();

// Security
app.use(helmet());

// CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Settings cache for global feature flags
app.use(settingsMiddleware);

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

// System status (public - needed for splash screen maintenance check)
apiRouter.get('/system/status', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['maintenance_mode', 'maintenance_message', 'latest_version', 'force_update']);

    if (error) {
      res.json({
        success: true,
        data: {
          maintenance_mode: false,
          maintenance_message: null,
          latest_version: '1.0.0',
          force_update: false,
        },
      });
      return;
    }

    const settings: Record<string, any> = {};
    (data || []).forEach((row: any) => {
      settings[row.key] = row.value;
    });

    res.json({
      success: true,
      data: {
        maintenance_mode: settings.maintenance_mode === true || settings.maintenance_mode === 'true',
        maintenance_message: settings.maintenance_message || null,
        latest_version: settings.latest_version || '1.0.0',
        force_update: settings.force_update === true || settings.force_update === 'true',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin routes (no maintenance check so admins can access during maintenance)
const adminModule = new AdminModule();
const paymentsModule = new PaymentsModule();
apiRouter.use('/admin/auth', adminModule.publicRouter);
apiRouter.use('/admin/wagers', authenticateAdmin, new WagersModule().adminRouter);
apiRouter.use('/admin/payments', authenticateAdmin, paymentsModule.adminRouter);
apiRouter.use('/admin/referrals', authenticateAdmin, new ReferralsModule().adminRouter);
apiRouter.use('/admin', authenticateAdmin, adminModule.protectedRouter);

// Maintenance mode check for user-facing routes
import { maintenanceModeMiddleware } from './common/middleware/maintenance.middleware';
apiRouter.use(maintenanceModeMiddleware);

// Public IMB payment gateway routes (must come before /payments to avoid auth middleware)
apiRouter.use('/payments/imb/callback', paymentsModule.imbRouter);
apiRouter.use('/payments/imb/webhook', paymentsModule.imbRouter);

// Protected user routes
apiRouter.use('/users', authenticateToken, new UsersModule().router);
apiRouter.use('/games', authenticateToken, new GamesModule().router);
apiRouter.use('/admin/games', authenticateAdmin, new GamesModule().adminRouter);
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
apiRouter.use('/wagers', authenticateToken, new WagersModule().router);
apiRouter.use('/payments', authenticateToken, paymentsModule.router);
apiRouter.use('/settlements', authenticateToken, new SettlementsModule().router);

app.use('/api/v1', apiRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
