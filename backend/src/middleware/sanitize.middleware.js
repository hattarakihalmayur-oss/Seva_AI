/**
 * Input Sanitization Middleware
 *
 * Strips dangerous HTML tags, script injections, and control characters
 * from request body, query params, and URL params. Defense-in-depth layer
 * that complements client-side validation and Helmet CSP headers.
 */

const DANGEROUS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/gi,
  /<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  let cleaned = str;
  for (const pattern of DANGEROUS_PATTERNS) {
    cleaned = cleaned.replace(pattern, '');
  }
  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');
  return cleaned;
}

function sanitizeValue(value) {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value !== null && typeof value === 'object') return sanitizeObject(value);
  return value;
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const cleanKey = sanitizeString(key);
    // Drop prototype pollution keys
    if (cleanKey === '__proto__' || cleanKey === 'constructor' || cleanKey === 'prototype') {
      continue;
    }
    sanitized[cleanKey] = sanitizeValue(value);
  }
  return sanitized;
}

export function sanitizeInputs(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

export default sanitizeInputs;
