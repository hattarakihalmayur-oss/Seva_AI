import { verifyToken } from '../utils/token.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

/**
 * Authentication Middleware:
 * Protects routes by validating JWT from the Authorization header or cookies.
 */
export async function protect(req, res, next) {
  try {
    let token = null;

    // Check Authorization header: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Access denied. You must be authenticated to access this resource.',
          code: 'UNAUTHORIZED_NO_TOKEN',
          statusCode: 401,
        },
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: {
            message: 'Your session has expired. Please log in again.',
            code: 'TOKEN_EXPIRED',
            statusCode: 401,
          },
        });
      }
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid authorization token.',
          code: 'INVALID_TOKEN',
          statusCode: 401,
        },
      });
    }

    // Verify user still exists in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'The citizen account belonging to this token no longer exists.',
          code: 'USER_NOT_FOUND',
          statusCode: 401,
        },
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware execution error', error);
    next(error);
  }
}

/**
 * Authorization Middleware:
 * Restrict access to designated user roles (e.g. 'admin')
 */
export function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have administrative permission to perform this action.',
          code: 'FORBIDDEN_INSUFFICIENT_PERMISSIONS',
          statusCode: 403,
        },
      });
    }
    next();
  };
}

/**
 * Optional Authentication Middleware:
 * Attaches user to req.user if a valid token is provided, but does not block if not.
 */
export async function optionalProtect(req, res, next) {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        if (decoded?.id) {
          const user = await User.findById(decoded.id).select('-password');
          if (user) req.user = user;
        }
      } catch (err) {
        // Silently proceed for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
}

export default {
  protect,
  restrictTo,
  optionalProtect,
};
