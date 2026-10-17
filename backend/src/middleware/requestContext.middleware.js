import { randomUUID } from 'crypto';

/**
 * Request Context Middleware
 *
 * Attaches a unique request ID and timing metadata to every request.
 * Used for log correlation, debugging, and response time tracking.
 */
export function requestContext(req, res, next) {
  req.id = req.headers['x-request-id'] || randomUUID();
  req.startTime = Date.now();

  res.setHeader('X-Request-ID', req.id);
  const originalEnd = res.end;
  res.end = function (...args) {
    if (!res.headersSent) {
      const duration = Date.now() - req.startTime;
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
    return originalEnd.apply(this, args);
  };

  next();
}

export default requestContext;
