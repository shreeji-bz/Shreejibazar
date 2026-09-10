import { SettingsRepository } from '../repositories/settings.repository';

export class SettingsService {
  constructor(private settingsRepo: SettingsRepository) {}

  async getAll() { return this.settingsRepo.getAll(); }
  async getByKey(key: string) { return this.settingsRepo.getByKey(key); }
  async set(key: string, value: string) { return this.settingsRepo.set(key, value); }
  async setMany(updates: Record<string, string>) { return this.settingsRepo.setMany(updates); }
}
