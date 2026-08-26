import { SettingEntity } from '../entities/setting.entity';

export interface ISettingsRepository {
  findAll(): Promise<SettingEntity[]>;
  findByKey(key: string): Promise<SettingEntity | null>;
  update(key: string, value: string): Promise<void>;
  updateMany(settings: Array<{ key: string; value: string }>): Promise<void>;
}
