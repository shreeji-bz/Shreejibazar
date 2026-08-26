import joi from 'joi';
export const createBannerSchema = joi.object({
  title: joi.string().required(),
  image: joi.string().required(),
  description: joi.string().optional(),
  action: joi.string().required(),
  actionValue: joi.string().optional(),
  sortOrder: joi.number().integer().default(0),
  startDate: joi.date().iso().optional(),
  endDate: joi.date().iso().optional(),
});
