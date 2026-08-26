export interface NotificationEntity {
  id: string;
  userId: string | null;
  title: string;
  message: string;
  image?: string;
  type: string;
  deepLink?: string;
  isRead: boolean;
  scheduledAt?: string;
  status: string;
  createdAt: string;
}
