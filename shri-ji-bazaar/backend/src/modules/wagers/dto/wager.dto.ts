import joi from 'joi';

export const placeWagerSchema = joi.object({
  gameId: joi.string().uuid().required(),
  // Empty string means "resolve the open round server-side" (the mobile app
  // sends '' when it does not know the round id yet).
  roundId: joi.string().uuid().allow('').optional(),
  playType: joi.string().valid('single', 'jodi', 'panel', 'double', 'crossing', 'palti').required(),
  selection: joi.string().required(),
  palti: joi.boolean().optional(),
  pointsStaked: joi.number().integer().positive().required(),
  wagerTypeId: joi.string().uuid().optional(),
  idempotencyKey: joi.string().optional(),
});

export const voidWagerSchema = joi.object({
  reason: joi.string().allow('').optional(),
});

export const settleWagerSchema = joi.object({
  resultText: joi.string().required(),
  isWinner: joi.boolean().required(),
  pointsWon: joi.number().integer().min(0).required(),
});

export const getWagersQuerySchema = joi.object({
  page: joi.number().integer().min(1).optional(),
  limit: joi.number().integer().min(1).max(100).optional(),
  status: joi.string().valid('pending', 'active', 'won', 'lost', 'void', 'cancelled').optional(),
  gameId: joi.string().uuid().optional(),
  roundId: joi.string().uuid().optional(),
  userId: joi.string().uuid().optional(),
});
