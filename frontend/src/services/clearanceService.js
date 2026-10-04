import { api } from './apiClient';


export const clearanceService = {
  // ---------- Student ---------- 
  listMine: (options) => api.get('/clearances/', options),
  studentDashboard: (options) => api.get('/clearances/student/dashboard/', options),
  get: (id, options) => api.get(`/clearances/${id}/`, options),

  // ---------- Officer ----------
  officerDashboard: (options) => api.get('/clearances/officer/dashboard/', options),
  listOfficeTasks: (options) => api.get('/clearances/offices/', options),
  
  clearOffice: (id, { notes = '' } = {}, options) =>
    api.patch(`/clearances/offices/${id}/`, { status: 'CLEARED', notes }, options),

  flagOffice: (id, { reason, description, notes = '' }, options) =>
    api.patch(
      `/clearances/offices/${id}/`,
      { status: 'FLAGGED', notes, issue_reason: reason, issue_description: description },
      options,
    ),
  listOfficerIssues: (options) => api.get('/clearances/issues/', options),

  resolveIssue: (id, resolutionNote, options) =>
    api.patch(`/clearances/issues/${id}/resolve/`, { resolution_note: resolutionNote }, options),


  // ---------- Registrar ----------
  registrarDashboard: (options) => api.get('/clearances/registrar/dashboard/', options), 
  listTypes: (options) => api.get('/clearances/types/', options),
 
  create: ({ studentId, clearanceTypeId }, options) =>
    api.post(
      '/clearances/create/',
      { student_id: studentId, clearance_type_id: clearanceTypeId },
      options,
    ),

  listAll: (status, options) => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return api.get(`/clearances/registrar/${query}`, options);
  },

  finalApprove: (id, options) => api.patch(`/clearances/${id}/approve/`, undefined, options),
    listAllIssues: (options) => api.get('/clearances/registrar/issues/', options),
};