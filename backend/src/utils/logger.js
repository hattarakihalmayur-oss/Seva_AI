/**
 * Structured Logger utility that sanitizes output and prevents credential leaks.
 */

// Keys to redact from logs
const SENSITIVE_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /authorization/i,
  /api[-_]?key/i,
  /mongo.*:\/\/.+:.+@/i, // MongoDB connection with user:pass
];

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  // Redact mongodb credentials like mongodb+srv://user:pass@host
  return str.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+(@.+)/g, '$1*****$2');
}

function sanitizeObject(obj, depth = 0) {
  if (depth > 4 || !obj || typeof obj !== 'object') {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitiveKey = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitiveKey) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info: (message, meta) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.log(`[${timestamp}] [INFO] ${message}`, sanitizeObject(meta));
    } else {
      console.log(`[${timestamp}] [INFO] ${message}`);
    }
  },
  warn: (message, meta) => {
    const timestamp = new Date().toISOString();
    if (meta) {
      console.warn(`[${timestamp}] [WARN] ${message}`, sanitizeObject(meta));
    } else {
      console.warn(`[${timestamp}] [WARN] ${message}`);
    }
  },
  error: (message, error) => {
    const timestamp = new Date().toISOString();
    if (error instanceof Error) {
      console.error(`[${timestamp}] [ERROR] ${message}: ${error.message}`);
      if (process.env.NODE_ENV !== 'production' && error.stack) {
        console.error(error.stack);
      }
    } else if (error) {
      console.error(`[${timestamp}] [ERROR] ${message}`, sanitizeObject(error));
    } else {
      console.error(`[${timestamp}] [ERROR] ${message}`);
    }
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toISOString();
      if (meta) {
        console.debug(`[${timestamp}] [DEBUG] ${message}`, sanitizeObject(meta));
      } else {
        console.debug(`[${timestamp}] [DEBUG] ${message}`);
      }
    }
  },
};

export default logger;
