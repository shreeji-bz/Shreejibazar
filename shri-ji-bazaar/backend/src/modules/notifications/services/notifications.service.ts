import { INotificationsRepository, NotificationsFindAllOptions } from '../interfaces/notifications.interface';
import { NotificationsRepository } from '../repositories/notifications.repository';

export class NotificationsService {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async findAll(options?: NotificationsFindAllOptions) {
    return this.notificationsRepository.findAll(options);
  }

  async findById(id: string) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async create(data: Partial<any>) {
    return this.notificationsRepository.create(data);
  }

  async createBulk(data: Partial<any>[]) {
    if (!data || data.length === 0) {
      return [];
    }
    return this.notificationsRepository.createBulk(data);
  }

  async updateStatus(id: string, isRead: boolean) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    await this.notificationsRepository.updateStatus(id, isRead);
    return { success: true };
  }
}
