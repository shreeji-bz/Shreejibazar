import joi from 'joi';
export const settingSchema = joi.object({
  key: joi.string().required(),
  value: joi.string().required(),
  type: joi.string().optional(),
});
