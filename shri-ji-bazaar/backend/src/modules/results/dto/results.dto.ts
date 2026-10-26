import joi from 'joi';

export const createSchema = joi.object({
  roundId: joi.string().uuid().required(),
  gameId: joi.string().uuid().optional(),
  result: joi.string().required(),
  declaredAt: joi.string().optional(),
});

export const updateSchema = joi.object({
  result: joi.string().optional(),
  declaredAt: joi.string().optional(),
});
