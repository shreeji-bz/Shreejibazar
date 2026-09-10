import joi from 'joi';

export const settleRoundSchema = joi.object({
  roundId: joi.string().uuid().required(),
  result: joi.string().required(),
});

export const settlementQuerySchema = joi.object({
  page: joi.number().integer().min(1).optional(),
  limit: joi.number().integer().min(1).max(100).optional(),
  gameId: joi.string().optional(),
});
