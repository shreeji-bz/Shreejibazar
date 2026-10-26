import joi from 'joi';

export const createSchema = joi.object({
  referrerId: joi.string().uuid().required(),
  referredId: joi.string().uuid().required(),
  referralCode: joi.string().required(),
  status: joi.string().valid('pending', 'completed', 'expired').default('pending'),
  rewardPoints: joi.number().integer().min(0).default(0),
});

export const updateSchema = joi.object({
  status: joi.string().valid('pending', 'completed', 'expired').optional(),
  rewardPoints: joi.number().integer().min(0).optional(),
});
