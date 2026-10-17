/**
 * Centralized Frontend Environment Configuration
 * 
 * Automatically resolves the backend API URL across:
 * - VITE_API_BASE_URL (standard)
 * - VITE_API_URL (common shortcut)
 * - VITE_BACKEND_URL (Render service link)
 * - Local fallback (http://localhost:5000/api) or relative (/api)
 */

function resolveApiBaseUrl() {
  const envVal =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL;

  if (envVal && typeof envVal === 'string' && envVal.trim()) {
    let clean = envVal.trim().replace(/\/+$/, '');
    // If user provided origin only (e.g. https://my-backend.onrender.com), append /api
    if (!clean.endsWith('/api') && (clean.startsWith('http://') || clean.startsWith('https://'))) {
      clean += '/api';
    }
    return clean;
  }

  // Sensible default: proxy /api in dev or relative /api in production
  return import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
}

const resolvedApiBaseUrl = resolveApiBaseUrl();

export const validateFrontendEnv = () => {
  const errors = [];
  if (!resolvedApiBaseUrl) {
    errors.push('Unable to resolve backend API URL. Please set VITE_API_BASE_URL in your deployment environment.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validation = validateFrontendEnv();

export const config = Object.freeze({
  apiBaseUrl: resolvedApiBaseUrl,
  appName: import.meta.env.VITE_APP_NAME || 'BharatSeva AI',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  validation,
});

export default config;

