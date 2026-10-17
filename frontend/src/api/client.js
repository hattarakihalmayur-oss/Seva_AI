import axios from 'axios';
import config from '../config/env';

// Enforce configuration check before initializing axios client
if (!config.validation.isValid) {
  console.error(
    '[BharatSeva Frontend Config Error] Configuration validation failed:',
    config.validation.errors
  );
}

/**
 * Centralized Axios client for all API interactions across BharatSeva AI.
 * Base URL is sourced strictly from validated environment configuration.
 */
const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Supports secure HTTP-only cookies in later phases
});

// Request Interceptor: Attach auth tokens if available, log in dev
apiClient.interceptors.request.use(
  (requestConfig) => {
    // If a token exists in sessionStorage/localStorage for bearer fallback (or cookie is handled)
    const token = localStorage.getItem('bharatseva_auth_token');
    if (token && !requestConfig.headers.Authorization) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Standardize error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      message: error.response?.data?.message || error.message || 'An unexpected network error occurred.',
      status: error.response?.status || 500,
      code: error.code,
      data: error.response?.data || null,
      isNetworkError: !error.response,
    };
    return Promise.reject(formattedError);
  }
);

export default apiClient;
