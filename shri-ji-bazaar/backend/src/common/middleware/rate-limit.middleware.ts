import rateLimit from 'express-rate-limit';
import { config } from '../../config/app.config';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
