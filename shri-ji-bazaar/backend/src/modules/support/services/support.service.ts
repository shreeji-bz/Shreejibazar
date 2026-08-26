import { SupportRepository } from '../repositories/support.repository';
import { NotificationService } from '../../notifications/services/notification.service';

export class SupportService {
  constructor(private supportRepository: SupportRepository, private notificationService: NotificationService) {}

  async getAll(options?: any) {
    return this.supportRepository.findAll(options);
  }

  async getById(id: string) {
    const ticket = await this.supportRepository.findById(id);
    if (!ticket) throw new Error('Ticket not found');
    const messages = await this.supportRepository.getMessages(id);
    return { ...ticket, messages };
  }

  async create(data: any) {
    const ticket = await this.supportRepository.create(data);
    await this.notificationService.create({
      userId: data.userId, title: 'Support Ticket Created', message: `Your ticket "${data.subject}" has been created.`, type: 'support',
    });
    return ticket;
  }

  async update(id: string, data: any) {
    return this.supportRepository.update(id, data);
  }

  async addMessage(data: any) {
    const message = await this.supportRepository.addMessage(data);
    return message;
  }
}
