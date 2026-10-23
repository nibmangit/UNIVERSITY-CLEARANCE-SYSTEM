from django.contrib import admin
from .models import AuditLog, Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'title', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'action', 'entity_type', 'entity_id', 'created_at')
    list_filter = ('action', 'entity_type', 'created_at')
    search_fields = ('user__username', 'description', 'action')
    readonly_fields = ('user', 'action', 'description', 'entity_type', 'entity_id', 'created_at')
