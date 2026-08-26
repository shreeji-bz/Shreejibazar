import joi from 'joi';

export const registerSchema = joi.object({
  name: joi.string().min(2).max(100).required(),
  mobile: joi.string().pattern(/^[6-9]\d{9}$/).required(),
  email: joi.string().email().optional(),
  password: joi.string().min(8).required(),
  confirmPassword: joi.string().required(),
  referralCode: joi.string().optional(),
});

export const loginSchema = joi.object({
  mobile: joi.string().pattern(/^[6-9]\d{9}$/).required(),
  password: joi.string().required(),
});

export const forgotPasswordSchema = joi.object({
  email: joi.string().email().required(),
});
