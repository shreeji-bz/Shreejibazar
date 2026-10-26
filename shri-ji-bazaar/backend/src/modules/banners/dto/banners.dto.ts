import joi from 'joi';

export const createSchema = joi.object({
  title: joi.string().required(),
  body: joi.string().default(''),
  image: joi.string().default(''),
  link: joi.string().uri().optional(),
  isActive: joi.boolean().default(true),
  sortOrder: joi.number().integer().default(0),
  startsAt: joi.string().optional(),
  endsAt: joi.string().optional(),
});

export const updateSchema = joi.object({
  title: joi.string().optional(),
  body: joi.string().optional(),
  image: joi.string().optional(),
  link: joi.string().uri().optional(),
  isActive: joi.boolean().optional(),
  sortOrder: joi.number().integer().optional(),
  startsAt: joi.string().optional(),
  endsAt: joi.string().optional(),
});
