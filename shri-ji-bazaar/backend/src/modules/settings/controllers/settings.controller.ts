import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  constructor(private settingsService: SettingsService, private router: any) {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.getAll.bind(this));
    this.router.put('/:key', this.updateSingle.bind(this));
  }

  async getAll(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.settingsService.getAll();
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateSingle(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const { value } = req.body;
      if (value === undefined) {
        res.status(400).json({ success: false, message: 'value is required' });
        return;
      }
      const data = await this.settingsService.updateSingle(key, String(value));
      res.json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
