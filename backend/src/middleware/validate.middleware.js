/**
 * Request Validation Middleware
 *
 * Lightweight field-level validators for critical API routes.
 * Returns a structured 422 error with field-level detail before
 * hitting controllers, keeping controllers thin.
 */

function createError(field, message) {
  return { field, message };
}

/**
 * Validates a registration payload.
 */
export function validateRegister(req, res, next) {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push(createError('name', 'Name must be at least 2 characters.'));
  }
  if (name && name.trim().length > 80) {
    errors.push(createError('name', 'Name must be under 80 characters.'));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push(createError('email', 'A valid email address is required.'));
  }

  if (!password || password.length < 8) {
    errors.push(createError('password', 'Password must be at least 8 characters.'));
  }
  if (password && password.length > 128) {
    errors.push(createError('password', 'Password must be under 128 characters.'));
  }

  const phone = req.body.phone || req.body.mobile;
  if (phone) {
    const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      errors.push(createError('phone', 'Please enter a valid 10-digit Indian mobile number.'));
    }
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed. Please correct the highlighted fields.',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        fields: errors,
      },
    });
  }

  next();
}

/**
 * Validates a login payload.
 */
export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push(createError('email', 'A valid email address is required.'));
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push(createError('password', 'Password is required.'));
  }

  if (errors.length > 0) {
    return res.status(422).json({
      success: false,
      error: {
        message: 'Validation failed.',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        fields: errors,
      },
    });
  }

  next();
}

/**
 * Validates AI query payload.
 */
export function validateAiQuery(req, res, next) {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(422).json({
      success: false,
      error: {
        message: 'A non-empty query string is required.',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        fields: [createError('query', 'query is required and must be a non-empty string.')],
      },
    });
  }

  if (query.trim().length > 1000) {
    return res.status(422).json({
      success: false,
      error: {
        message: 'Query is too long. Maximum 1000 characters allowed.',
        code: 'VALIDATION_ERROR',
        statusCode: 422,
        fields: [createError('query', 'Query exceeds 1000 character limit.')],
      },
    });
  }

  next();
}

export default { validateRegister, validateLogin, validateAiQuery };
