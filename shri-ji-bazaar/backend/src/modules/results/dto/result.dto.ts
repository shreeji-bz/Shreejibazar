import joi from 'joi';
export const declareResultSchema = joi.object({
  roundId: joi.string().uuid().required(),
  result: joi.string().required(),
});
