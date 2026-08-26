/**
 * Shri Ji Bazaar - Points DTOs
 */

import joi from 'joi';

export const creditPointsSchema = joi.object({
  userId: joi.string().required(),
  amount: joi.number().positive().required(),
  description: joi.string().required(),
  referenceId: joi.string().optional(),
  referenceType: joi.string().optional(),
});

export const debitPointsSchema = joi.object({
  userId: joi.string().required(),
  amount: joi.number().positive().required(),
  description: joi.string().required(),
  referenceId: joi.string().optional(),
  referenceType: joi.string().optional(),
});

export const adjustPointsSchema = joi.object({
  userId: joi.string().required(),
  amount: joi.number().not(0).required(),
  description: joi.string().required(),
});
