import apiClient from './client';

export const fetchSavedSchemes = async () => {
  const response = await apiClient.get('/saved-schemes');
  return response.data;
};

export const bookmarkScheme = async (schemeSlug, notes = '') => {
  const response = await apiClient.post('/saved-schemes', { schemeSlug, notes });
  return response.data;
};

export const removeBookmark = async (schemeSlug) => {
  const response = await apiClient.delete(`/saved-schemes/${schemeSlug}`);
  return response.data;
};

export const checkBookmarkStatus = async (schemeSlug) => {
  const response = await apiClient.get(`/saved-schemes/check/${schemeSlug}`);
  return response.data;
};

export default {
  fetchSavedSchemes,
  bookmarkScheme,
  removeBookmark,
  checkBookmarkStatus,
};
