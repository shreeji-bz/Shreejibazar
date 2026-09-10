import { ActivitiesService } from '../services/activities.service';

export class ActivitiesRepository {
  constructor(private service: ActivitiesService) {}

  async getUserActivities(userId: string, options: any) {
    return this.service.getUserActivities(userId, options);
  }

  async logActivity(data: any) {
    return this.service.logActivity(data);
  }
}
