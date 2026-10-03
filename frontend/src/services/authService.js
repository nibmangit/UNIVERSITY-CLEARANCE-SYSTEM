import { api, tokenStorage } from './apiClient';

export const authService = { 
  async login({ universityId, password }) {
    const tokens = await api.post(
      '/auth/login/',
      { university_id: universityId, password },
      { auth: false },
    );
    tokenStorage.set(tokens);

    try {
      return await api.get('/auth/me/');
    } catch (error) {
      tokenStorage.clear();
      throw error;
    }
  },

  logout() {
    tokenStorage.clear();
  },

  me: (options) => api.get('/auth/me/', options),
  profile: (options) => api.get('/auth/profile/', options),
};