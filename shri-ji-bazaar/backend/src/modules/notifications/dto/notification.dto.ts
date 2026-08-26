import joi from 'joi';
export const createNotificationSchema = joi.object({
  userId: joi.string().uuid().optional(),
  title: joi.string().required(),
  message: joi.string().required(),
  type: joi.string().required(),
  deepLink: joi.string().optional(),
});
