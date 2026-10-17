import apiClient from './client';

/**
 * Fetch health status from the backend API.
 * Uses the centralized apiClient and does not hard-code paths or hostnames.
 */
export const checkBackendHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

export default {
  checkBackendHealth,
};
