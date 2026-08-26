import joi from 'joi';
export const createRoundSchema = joi.object({
  gameId: joi.string().uuid().required(),
  roundNumber: joi.string().required(),
  startTime: joi.date().iso().required(),
  endTime: joi.date().iso().required(),
});
