import envConfig from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Centralized error handler middleware.
 * Ensures consistent error response format and prevents leaking sensitive stack traces in production.
 */
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Log error with request context
  logger.error(`Unhandled Error [${req.method} ${req.originalUrl}]`, err);

  const responsePayload = {
    success: false,
    error: {
      message: err.message || 'An internal server error occurred.',
      code: err.code || 'INTERNAL_ERROR',
      statusCode,
    },
  };

  // Include stack trace only in development
  if (envConfig.isDevelopment && err.stack) {
    responsePayload.error.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
}

export default errorHandler;
