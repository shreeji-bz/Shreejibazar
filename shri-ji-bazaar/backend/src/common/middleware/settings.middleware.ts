import { Request, Response, NextFunction } from 'express';
import { getSettingsMap } from '../../common/utils/settings.util';

export const settingsMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await getSettingsMap();
    (req as any).appSettings = settings;
    next();
  } catch (error) {
    next();
  }
};
