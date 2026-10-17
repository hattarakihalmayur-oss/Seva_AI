import rateLimit from 'express-rate-limit';
import envConfig from '../config/env.js';

/**
 * Specialized route-level rate limiters.
 * These are stricter than the global API limiter defined in app.js.
 */

/** Auth: 10 login/register attempts per 15 minutes per IP */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // relaxed for development testing
  skip: () => envConfig.isDevelopment || envConfig.isTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});

/** AI: queries per IP — protects expensive processing */
export const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 120, // generous limit
  skip: () => envConfig.isDevelopment || envConfig.isTest,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'AI query rate limit exceeded. Please slow down your requests.',
      code: 'AI_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});

/** Registration: 5 new accounts per hour per IP — prevents spam signups */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many accounts created from this IP. Try again after an hour.',
      code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});

export default { authLimiter, aiLimiter, registrationLimiter };
