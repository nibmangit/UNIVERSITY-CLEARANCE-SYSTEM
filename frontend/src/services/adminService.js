import { api } from './apiClient';

// Builds "?a=1&b=2", skipping empty values.
function toQuery(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  }
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const adminService = {
  /** { count, next, previous, results }. Params: page, page_size, search, action, entity_type, role, date_from, date_to. */
  listAuditLogs: (params, options) => api.get(`/notifications/audit-logs/${toQuery(params)}`, options),

  /** { actions, entity_types, summary: { total, today, last_7_days, users } } */
  auditLogMeta: (options) => api.get('/notifications/audit-logs/meta/', options),
};