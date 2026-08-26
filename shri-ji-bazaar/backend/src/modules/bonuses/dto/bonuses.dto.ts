import joi from 'joi';

export const createBonusSchema = joi.object({
  name: joi.string().required(),
  slug: joi.string().required(),
  description: joi.string().required(),
  points: joi.number().integer().required(),
  type: joi.string().valid('daily', 'weekly', 'login', 'achievement', 'referral', 'special').required(),
  status: joi.string().valid('active', 'inactive', 'expired').default('active'),
  startDate: joi.date().iso().optional(),
  endDate: joi.date().iso().optional(),
});

export const claimBonusSchema = joi.object({
  bonusId: joi.string().uuid().required(),
});
