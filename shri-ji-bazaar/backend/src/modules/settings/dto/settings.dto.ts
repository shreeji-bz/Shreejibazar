import joi from 'joi';

export const createSchema = joi.object({
  // TODO: Add validation schema
});

export const updateSchema = joi.object({
  id: joi.string().uuid().required(),
});
