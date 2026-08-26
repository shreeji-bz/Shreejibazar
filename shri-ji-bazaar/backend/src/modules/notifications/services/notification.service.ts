import { NotificationRepository } from '../repositories/notification.repository';

export class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}

  async getUserNotifications(userId: string, options?: any) {
    return this.notificationRepository.findByUserId(userId, options);
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(id: string) {
    return this.notificationRepository.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

  async create(data: any) {
    return this.notificationRepository.create(data);
  }
}
