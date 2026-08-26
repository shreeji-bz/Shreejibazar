export interface GameEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  openingTime: string;
  closingTime: string;
  resultTime: string;
  status: 'active' | 'inactive' | 'maintenance';
  isPopular: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
