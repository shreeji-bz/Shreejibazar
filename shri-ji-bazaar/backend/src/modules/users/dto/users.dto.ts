import joi from 'joi';
export const updateUserSchema = joi.object({
  id: joi.string().uuid().required(),
  name: joi.string().optional(),
  email: joi.string().email().optional(),
  status: joi.string().valid('active', 'inactive', 'suspended').optional(),
});
