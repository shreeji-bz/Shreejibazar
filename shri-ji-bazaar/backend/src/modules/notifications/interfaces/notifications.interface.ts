import { NotificationEntity } from '../entities/notifications.entity';

export interface INotificationsRepository {
  getForUser(userId: string, page?: number, limit?: number): Promise<{ data: NotificationEntity[]; total: number }>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  create(data: { title: string; message: string; type?: string; userId?: string }): Promise<NotificationEntity | null>;
}
