/**
 * Centralized Frontend Environment Configuration
 * 
 * NOTE FOR DEVELOPERS & DEPLOYMENT:
 * - Vite embeds all variables prefixed with `VITE_` into client-side JS at BUILD TIME.
 * - These variables are completely visible to end users in browser dev tools.
 * - NEVER include server secrets, JWT secret keys, Sarvam API keys, or database credentials here.
 * - In production, VITE_API_BASE_URL must be supplied prior to or during `npm run build`.
 */

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

// Validation check
export const validateFrontendEnv = () => {
  const errors = [];

  if (!rawApiBaseUrl || typeof rawApiBaseUrl !== 'string' || !rawApiBaseUrl.trim()) {
    errors.push('VITE_API_BASE_URL is missing or empty. Please set it in frontend/.env or your deployment environment.');
  } else {
    try {
      // Validate that it looks like a valid URL or relative path
      if (!rawApiBaseUrl.startsWith('/') && !rawApiBaseUrl.startsWith('http://') && !rawApiBaseUrl.startsWith('https://')) {
        errors.push(`VITE_API_BASE_URL ("${rawApiBaseUrl}") must be an absolute URL (http:// or https://) or a relative path starting with /.`);
      }
    } catch (e) {
      errors.push(`Invalid VITE_API_BASE_URL: ${e.message}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validation = validateFrontendEnv();

// Cleaned up base URL (strip trailing slashes)
const cleanApiBaseUrl = rawApiBaseUrl ? rawApiBaseUrl.trim().replace(/\/+$/, '') : '';

export const config = Object.freeze({
  apiBaseUrl: cleanApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || 'BharatSeva AI',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  validation,
});

export default config;
