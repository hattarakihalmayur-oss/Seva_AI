import jwt from 'jsonwebtoken';
import envConfig from '../config/env.js';

/**
 * Generate a signed JWT for an authenticated citizen or admin
 */
export function generateToken(payload) {
  return jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: envConfig.JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token synchronously or throws
 */
export function verifyToken(token) {
  return jwt.verify(token, envConfig.JWT_SECRET);
}

export default {
  generateToken,
  verifyToken,
};
