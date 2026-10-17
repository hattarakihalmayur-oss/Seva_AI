import apiClient from './client';

export const fetchSchemes = async (params = {}) => {
  const response = await apiClient.get('/schemes', { params });
  return response.data;
};

export const fetchSchemeDetails = async (identifier) => {
  const response = await apiClient.get(`/schemes/${identifier}`);
  return response.data;
};

export default {
  fetchSchemes,
  fetchSchemeDetails,
};
