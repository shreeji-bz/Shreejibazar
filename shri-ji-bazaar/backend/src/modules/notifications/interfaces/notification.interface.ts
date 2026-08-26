export interface INotificationRepository {
  findAll(options?: any): Promise<any>;
  findById(id: string): Promise<any | null>;
  create(data: any): Promise<any>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
