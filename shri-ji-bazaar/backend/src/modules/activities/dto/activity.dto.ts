import joi from 'joi';
export const playSchema = joi.object({
  gameId: joi.string().uuid().required(),
  roundId: joi.string().uuid().required(),
  playType: joi.string().valid('single', 'jodi', 'panel', 'double').required(),
  selection: joi.string().required(),
  points: joi.number().integer().min(10).required(),
  idempotencyKey: joi.string().required(),
});
