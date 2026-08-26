export interface BannerEntity {
  id: string;
  title: string;
  image: string;
  description?: string;
  action: string;
  actionValue?: string;
  status: string;
  sortOrder: number;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
