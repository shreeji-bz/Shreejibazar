import joi from 'joi';
export const referralSchema = joi.object({
  referralCode: joi.string().required(),
});
