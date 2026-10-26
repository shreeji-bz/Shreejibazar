export interface SettingsEntity {
  id: string;
  key: string;
  value: string | null;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  updatedAt: string;
}
