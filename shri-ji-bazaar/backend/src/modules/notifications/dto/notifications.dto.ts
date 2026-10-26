import joi from 'joi';

export const createSchema = joi.object({
  userId: joi.string().uuid().optional(),
  title: joi.string().required(),
  message: joi.string().required(),
  type: joi.string().valid('info', 'success', 'warning', 'error', 'result').default('info'),
  data: joi.object().optional(),
  scheduledAt: joi.string().optional(),
});

export const updateSchema = joi.object({
  title: joi.string().optional(),
  message: joi.string().optional(),
  type: joi.string().valid('info', 'success', 'warning', 'error', 'result').optional(),
  isRead: joi.boolean().optional(),
});
