import { Request, Response, NextFunction } from 'express';
import { getCachedSetting } from '../../common/utils/settings.util';

export const maintenanceModeMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const maintenanceMode = getCachedSetting('maintenance_mode');
    if (maintenanceMode === 'true') {
      res.status(503).json({
        success: false,
        message: 'App is under maintenance. Please try again later.',
        code: 'MAINTENANCE_MODE',
      });
      return;
    }
    next();
  } catch {
    next();
  }
};
