import joi from 'joi';

export const createBannerSchema = joi.object({
  title: joi.string().required(),
  image: joi.string().required(),
  description: joi.string().optional(),
  action: joi.string().optional(),
  actionValue: joi.string().optional(),
  sortOrder: joi.number().integer().default(0),
  startDate: joi.string().optional(),
  endDate: joi.string().optional(),
  isActive: joi.boolean().default(true),
});

export const updateBannerSchema = joi.object({
  title: joi.string().optional(),
  image: joi.string().optional(),
  description: joi.string().optional(),
  action: joi.string().optional(),
  actionValue: joi.string().optional(),
  sortOrder: joi.number().integer().optional(),
  startDate: joi.string().optional(),
  endDate: joi.string().optional(),
  isActive: joi.boolean().optional(),
});
