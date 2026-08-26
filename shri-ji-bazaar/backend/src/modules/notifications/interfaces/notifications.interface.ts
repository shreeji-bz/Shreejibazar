export interface INotificationsRepository {
  findAll(options?: NotificationsFindAllOptions): Promise<{ data: any[]; total: number }>;
  findById(id: string): Promise<any | null>;
  create(data: Partial<any>): Promise<any>;
  createBulk(data: Partial<any>[]): Promise<any[]>;
  updateStatus(id: string, isRead: boolean): Promise<void>;
}

export interface NotificationsFindAllOptions {
  userId?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}
