from rest_framework import serializers

from .models import Notification, AuditLog


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'type',
            'is_read',
            'clearance',
            'issue',
            'created_at',
        ]
        read_only_fields = fields

class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'action', 'description', 'entity_type', 'entity_id', 'created_at']
        read_only_fields = fields

    def get_user(self, obj):
        user = obj.user

        if hasattr(user, 'staff_profile'):
            full_name = user.staff_profile.full_name
        elif hasattr(user, 'student_profile'):
            full_name = user.student_profile.full_name
        else:
            full_name = user.get_full_name() or user.username

        return {
            'id': user.id,
            'full_name': full_name,
            'university_id': user.university_id,
            'role': user.role,
        }