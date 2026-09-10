import { NotificationsRepository } from '../repositories/notifications.repository';

export class NotificationsService {
  constructor(private notificationsRepo: NotificationsRepository) {}

  async getUserNotifications(userId: string, page = 1, limit = 20) {
    return this.notificationsRepo.getForUser(userId, page, limit);
  }

  async getUnreadCount(userId: string) {
    return this.notificationsRepo.getUnreadCount(userId);
  }

  async markAsRead(id: string) {
    return this.notificationsRepo.markAsRead(id);
  }

  async markAllAsRead(userId: string) {
    return this.notificationsRepo.markAllAsRead(userId);
  }

  async sendNotification(data: { title: string; message: string; type?: string; target?: string; userIds?: string[] }) {
    if (data.target === 'all') {
      return this.notificationsRepo.create({ title: data.title, message: data.message, type: data.type });
    }

    const results = [];
    for (const uid of data.userIds || []) {
      results.push(await this.notificationsRepo.create({ title: data.title, message: data.message, type: data.type, userId: uid }));
    }
    return results;
  }
}
