import joi from 'joi';

export const createGameSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  slug: joi.string().alphanum().required(),
  description: joi.string().optional(),
  image: joi.string().optional(),
  openingTime: joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  closingTime: joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  resultTime: joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  status: joi.string().valid('active', 'inactive', 'maintenance').default('active'),
  isPopular: joi.boolean().default(false),
  sortOrder: joi.number().integer().default(0),
});

export const updateGameSchema = joi.object({
  id: joi.string().uuid().required(),
  name: joi.string().min(2).max(100).optional(),
  description: joi.string().optional(),
  image: joi.string().optional(),
  openingTime: joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  closingTime: joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  resultTime: joi.string().pattern(/^\d{2}:\d{2}$/).optional(),
  status: joi.string().valid('active', 'inactive', 'maintenance').optional(),
  isPopular: joi.boolean().optional(),
  sortOrder: joi.number().integer().optional(),
});
