export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  image?: string;
  type: string;
  deepLink?: string;
  isRead: boolean;
  scheduledAt?: Date;
  status: string;
  createdAt: Date;
}
