export interface BannersEntity {
  id: string;
  title: string;
  body: string;
  image: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}
