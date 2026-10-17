import apiClient from './client';

export const registerCitizen = async (userData) => {
  const response = await apiClient.post('/auth/register', userData);
  return response.data;
};

export const loginCitizen = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
};

export const generateLoginOtp = async (mobile) => {
  const response = await apiClient.post('/auth/otp/generate', { mobile });
  return response.data;
};

export const verifyLoginOtp = async (mobile, otp) => {
  const response = await apiClient.post('/auth/otp/verify', { mobile, otp });
  return response.data;
};

export const getCurrentCitizen = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const updateCitizenProfile = async (profileData) => {
  const response = await apiClient.put('/auth/profile', profileData);
  return response.data;
};

export default {
  registerCitizen,
  loginCitizen,
  generateLoginOtp,
  verifyLoginOtp,
  getCurrentCitizen,
  updateCitizenProfile,
};
