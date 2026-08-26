import joi from 'joi';
export const createTicketSchema = joi.object({
  subject: joi.string().required(),
  category: joi.string().valid('general', 'technical', 'points', 'game', 'other').required(),
  description: joi.string().required(),
});
export const messageSchema = joi.object({
  message: joi.string().required(),
});
