import { createBannerSchema } from '../src/modules/banners/dto/banner.dto';
import { createSchema as createBannerRecordSchema } from '../src/modules/banners/dto/banners.dto';
import { createSchema as createNotificationSchema } from '../src/modules/notifications/dto/notifications.dto';
import { createSchema as createReferralSchema } from '../src/modules/referrals/dto/referrals.dto';
import { createSchema as createResultSchema } from '../src/modules/results/dto/results.dto';
import { createSchema as createRoundSchema, updateSchema as updateRoundSchema } from '../src/modules/rounds/dto/rounds.dto';
import { createSchema as createSettingSchema } from '../src/modules/settings/dto/settings.dto';
import { createTicketSchema, messageSchema } from '../src/modules/support/dto/support.dto';

describe('banner dtos', () => {
  it('createBannerSchema validates a full payload', () => {
    const { error } = createBannerSchema.validate({
      title: 'Sale',
      image: '/banners/sale.png',
      description: 'Weekend only',
      sortOrder: 1,
    });
    expect(error).toBeUndefined();
  });

  it('createBannerSchema rejects a missing title', () => {
    const { error } = createBannerSchema.validate({ image: '/x.png' });
    expect(error).toBeDefined();
  });

  it('createBannerRecordSchema defaults body, image and isActive', () => {
    const { value, error } = createBannerRecordSchema.validate({ title: 'Sale' });
    expect(error).toBeUndefined();
    expect(value.body).toBe('');
    expect(value.image).toBe('');
    expect(value.isActive).toBe(true);
    expect(value.sortOrder).toBe(0);
  });
});

describe('notifications dtos', () => {
  it('createNotificationSchema defaults type to info and allows null-ish userId omission', () => {
    const { value, error } = createNotificationSchema.validate({ title: 'T', message: 'M' });
    expect(error).toBeUndefined();
    expect(value.type).toBe('info');
  });

  it('createNotificationSchema rejects an unknown type', () => {
    const { error } = createNotificationSchema.validate({ title: 'T', message: 'M', type: 'bogus' });
    expect(error).toBeDefined();
  });
});

describe('referrals dtos', () => {
  it('createReferralSchema validates a pending referral with no reward', () => {
    const { value, error } = createReferralSchema.validate({
      referrerId: '11111111-1111-1111-1111-111111111111',
      referredId: '22222222-2222-2222-2222-222222222222',
      referralCode: 'ABC123',
    });
    expect(error).toBeUndefined();
    expect(value.status).toBe('pending');
    expect(value.rewardPoints).toBe(0);
  });

  it('createReferralSchema rejects a negative reward', () => {
    const { error } = createReferralSchema.validate({
      referrerId: '11111111-1111-1111-1111-111111111111',
      referredId: '22222222-2222-2222-2222-222222222222',
      referralCode: 'ABC123',
      rewardPoints: -5,
    });
    expect(error).toBeDefined();
  });
});

describe('results dtos', () => {
  it('createResultSchema requires roundId and result', () => {
    const { error } = createResultSchema.validate({ roundId: '11111111-1111-1111-1111-111111111111' });
    expect(error).toBeDefined();

    const { value, error: ok } = createResultSchema.validate({
      roundId: '11111111-1111-1111-1111-111111111111',
      result: 'W',
    });
    expect(ok).toBeUndefined();
    expect(value.result).toBe('W');
  });
});

describe('rounds dtos', () => {
  it('createRoundSchema validates a full payload', () => {
    const { value, error } = createRoundSchema.validate({
      gameId: '11111111-1111-1111-1111-111111111111',
      roundNumber: 3,
      startTime: '2026-10-26T10:00:00.000Z',
      endTime: '2026-10-26T10:20:00.000Z',
      resultTime: '2026-10-26T10:25:00.000Z',
    });
    expect(error).toBeUndefined();
    expect(value.status).toBe('pending');
  });

  it('createRoundSchema rejects roundNumber below 1', () => {
    const { error } = createRoundSchema.validate({
      gameId: '11111111-1111-1111-1111-111111111111',
      roundNumber: 0,
      startTime: '2026-10-26T10:00:00.000Z',
      endTime: '2026-10-26T10:20:00.000Z',
      resultTime: '2026-10-26T10:25:00.000Z',
    });
    expect(error).toBeDefined();
  });

  it('updateRoundSchema accepts a result declaration', () => {
    const { value, error } = updateRoundSchema.validate({ status: 'result_declared', result: 'W', declaredAt: '2026-10-26T10:25:00.000Z' });
    expect(error).toBeUndefined();
    expect(value.status).toBe('result_declared');
  });
});

describe('settings dtos', () => {
  it('createSettingSchema requires a key and defaults type to string', () => {
    const { value, error } = createSettingSchema.validate({ key: 'referral_reward', value: '50' });
    expect(error).toBeUndefined();
    expect(value.type).toBe('string');
  });

  it('createSettingSchema rejects an unknown type', () => {
    const { error } = createSettingSchema.validate({ key: 'k', type: 'blob' });
    expect(error).toBeDefined();
  });
});

describe('support dtos', () => {
  it('createTicketSchema validates a valid category', () => {
    const { error } = createTicketSchema.validate({ subject: 'Bug', category: 'technical', description: 'Crashes' });
    expect(error).toBeUndefined();
  });

  it('createTicketSchema rejects an invalid category', () => {
    const { error } = createTicketSchema.validate({ subject: 'Bug', category: 'nonsense', description: 'Crashes' });
    expect(error).toBeDefined();
  });

  it('messageSchema requires a non-empty message', () => {
    const { error } = messageSchema.validate({});
    expect(error).toBeDefined();
  });
});
