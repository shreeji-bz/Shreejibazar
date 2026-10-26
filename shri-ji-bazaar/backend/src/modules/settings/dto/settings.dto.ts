import joi from 'joi';

export const createSchema = joi.object({
  key: joi.string().required(),
  value: joi.string().optional().allow(null),
  type: joi.string().valid('string', 'number', 'boolean', 'json').default('string'),
  description: joi.string().optional(),
});

export const updateSchema = joi.object({
  value: joi.string().optional().allow(null),
  type: joi.string().valid('string', 'number', 'boolean', 'json').optional(),
  description: joi.string().optional(),
});
