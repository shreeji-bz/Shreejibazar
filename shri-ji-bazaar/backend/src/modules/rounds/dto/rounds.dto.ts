import joi from 'joi';

export const createSchema = joi.object({
  gameId: joi.string().uuid().required(),
  roundNumber: joi.number().integer().min(1).required(),
  startTime: joi.string().isoDate().required(),
  endTime: joi.string().isoDate().required(),
  resultTime: joi.string().isoDate().required(),
  status: joi.string().valid('pending', 'open', 'closed', 'result_declared').default('pending'),
});

export const updateSchema = joi.object({
  status: joi.string().valid('pending', 'open', 'closed', 'result_declared').optional(),
  result: joi.string().optional(),
  declaredAt: joi.string().optional(),
});
