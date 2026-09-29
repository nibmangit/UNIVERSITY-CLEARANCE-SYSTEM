from .models import AuditLog, Notification


class AuditLogService:

    @staticmethod
    def log(*, user, action, description,  entity_type, entity_id, ):
        return AuditLog.objects.create(
            user=user,
            action=action,
            description=description,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        
class NotificationService:

    @staticmethod
    def create(
        *, user, title, message,
        notification_type=Notification.Type.CLEARANCE,
        clearance=None, issue=None,
    ):
        return Notification.objects.create(
            user=user,
            title=title,
            message=message,
            type=notification_type,
            clearance=clearance,
            issue=issue,
        )