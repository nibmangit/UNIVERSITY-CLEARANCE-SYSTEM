from django.urls import path

from .views import AuditLogListView, AuditLogMetaView, NotificationClearReadView, NotificationDeleteView, NotificationListView, NotificationMarkAllReadView, NotificationMarkReadView, NotificationUnreadCountView


urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('unread-count/', NotificationUnreadCountView.as_view(), name='notification-unread-count'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(), name='notification-mark-read', ),
    path('read-all/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read', ),
    
    path('clear-read/', NotificationClearReadView.as_view(), name='notification-clear-read'),
    path('<int:pk>/', NotificationDeleteView.as_view(), name='notification-delete'),
    
        path('audit-logs/', AuditLogListView.as_view(), name='audit-log-list'),
    path('audit-logs/meta/', AuditLogMetaView.as_view(), name='audit-log-meta'),
]