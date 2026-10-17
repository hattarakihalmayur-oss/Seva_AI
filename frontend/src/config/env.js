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
  // 1. Allow runtime query parameter override (e.g. ?apiUrl=https://seva-ai-backend.onrender.com/api)
  if (typeof window !== 'undefined') {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const paramUrl = searchParams.get('apiUrl') || searchParams.get('backendUrl');
      if (paramUrl) {
        let clean = paramUrl.trim().replace(/\/+$/, '');
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = 'https://' + clean;
        }
        if (!clean.endsWith('/api')) clean += '/api';
        localStorage.setItem('seva_api_url', clean);
        return clean;
      }

      // 2. Allow localStorage override
      const stored = localStorage.getItem('seva_api_url') || localStorage.getItem('bharatseva_api_url');
      if (stored && typeof stored === 'string' && stored.trim()) {
        let clean = stored.trim().replace(/\/+$/, '');
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = 'https://' + clean;
        }
        if (!clean.endsWith('/api')) clean += '/api';
        return clean;
      }
    } catch {}
  }

  // 3. Environment variable set at build time
  const envVal =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL;

  if (envVal && typeof envVal === 'string' && envVal.trim()) {
    let clean = envVal.trim().replace(/\/+$/, '');
    // If Render host was provided without protocol (e.g. seva-ai-backend.onrender.com)
    if (!clean.startsWith('http://') && !clean.startsWith('https://') && !clean.startsWith('/')) {
      clean = 'https://' + clean;
    }
    // If user provided origin only without /api, append /api
    if (!clean.endsWith('/api') && (clean.startsWith('http://') || clean.startsWith('https://'))) {
      clean += '/api';
    }
    return clean;
  }

  // 4. In browser on Render (*.onrender.com) when no env var was supplied:
  // Dynamically resolve to the corresponding backend service: https://seva-ai-backend.onrender.com/api
  if (typeof window !== 'undefined' && window.location?.hostname?.includes('onrender.com')) {
    const host = window.location.hostname;
    let backendHost = 'seva-ai-backend.onrender.com';
    if (host.includes('-frontend.onrender.com')) {
      backendHost = host.replace('-frontend.onrender.com', '-backend.onrender.com');
    }
    return `https://${backendHost}/api`;
  }

  // 5. Default: dev proxy or relative /api
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

