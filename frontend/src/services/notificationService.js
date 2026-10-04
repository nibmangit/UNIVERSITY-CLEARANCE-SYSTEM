import { api } from './apiClient';

const NOTIFICATIONS_CHANGED = 'notifications:changed';

/** Call after marking notifications read, so the navbar bell refreshes its count. */
export function announceNotificationChange() {
  window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED));
}

/** Calls `handler` whenever announceNotificationChange() is called. Returns an unsubscribe function. */
export function onNotificationChange(handler) {
  window.addEventListener(NOTIFICATIONS_CHANGED, handler);
  return () => window.removeEventListener(NOTIFICATIONS_CHANGED, handler);
}

export const notificationService = {
  list: (options) => api.get('/notifications/', options),
  markRead: (id, options) => api.patch(`/notifications/${id}/read/`, undefined, options),
  markAllRead: (options) => api.patch('/notifications/read-all/', undefined, options),
  /** { count: 3 } */
  unreadCount: (options) => api.get('/notifications/unread-count/', options),
};