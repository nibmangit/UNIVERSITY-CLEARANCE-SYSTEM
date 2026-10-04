import { api } from './apiClient';


export const clearanceService = {
  // ---------- Student ---------- 

  listMine: (options) => api.get('/clearances/', options),
  studentDashboard: (options) => api.get('/clearances/student/dashboard/', options),
};