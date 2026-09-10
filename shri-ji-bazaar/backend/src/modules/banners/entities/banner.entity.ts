export interface BannerEntity {
  id: string;
  title: string;
  image: string;
  description?: string;
  action?: string;
  actionValue?: string;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
