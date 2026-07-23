import apiClient from './apiClient';

export const authApi = {
  // POST /api/auth/register
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  // POST /api/auth/login
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  // POST /api/auth/logout
  logout: async () => {
    return apiClient.post('/auth/logout');
  }
};
