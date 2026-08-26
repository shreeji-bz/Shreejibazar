import { ActivityRepository } from '../repositories/activity.repository';
import type { FindAllOptions, CreateActivityData } from '../interfaces/activity.interface';

export class ActivityService {
  constructor(
    private activityRepository: ActivityRepository,
    private pointsService: any,
  ) {}

  async findAll(userId: string, options: FindAllOptions) {
    return this.activityRepository.findAll({ ...options, userId });
  }

  async findById(id: string) {
    const activity = await this.activityRepository.findById(id);
    if (!activity) throw new Error('Activity not found');
    return activity;
  }

  async create(userId: string, data: CreateActivityData) {
    if (data.idempotencyKey) {
      const existing = await this.activityRepository.findByIdempotencyKey(data.idempotencyKey);
      if (existing) return existing;
    }

    const play = await this.activityRepository.create({
      userId,
      gameId: data.gameId,
      roundId: data.roundId,
      playType: data.playType,
      selection: data.selection,
      points: data.points,
      idempotencyKey: data.idempotencyKey,
    });

    return play;
  }

  async createPlay(userId: string, data: any) {
    const debitResult = await this.pointsService.debitPoints(
      userId,
      data.points,
      `Play on game: ${data.playType || data.gameId}`,
      data.roundId,
      'play'
    );

    const play = await this.create(userId, data);
    return { ...play, balanceAfter: debitResult.balanceAfter };
  }

  async updateResult(id: string, result: string, status: string) {
    const activity = await this.activityRepository.findById(id);
    if (!activity) throw new Error('Activity not found');
    await this.activityRepository.updateResult(id, result, status);
  }
}
