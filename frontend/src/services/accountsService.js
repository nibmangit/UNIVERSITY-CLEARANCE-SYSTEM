import { api } from './apiClient';

export const accountsService = {
    
  listStudents: (search, options) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return api.get(`/auth/students/${query}`, options);
  },
};