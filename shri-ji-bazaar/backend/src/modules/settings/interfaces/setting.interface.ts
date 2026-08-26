export interface ISettingRepository {
  findAll(): Promise<any[]>;
  findByKey(key: string): Promise<any | null>;
  set(key: string, value: string, type?: string): Promise<void>;
  get(key: string): Promise<string | null>;
}
