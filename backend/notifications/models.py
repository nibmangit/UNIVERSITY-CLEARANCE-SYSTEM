from django.db import models

from accounts.models import User
from clearance.models import Clearance, Issue


class Notification(models.Model):
    class Type(models.TextChoices):
        INFO = 'INFO', 'Info'
        SUCCESS = 'SUCCESS', 'Success'
        WARNING = 'WARNING', 'Warning'
        ISSUE = 'ISSUE', 'Issue'

    user = models.ForeignKey(
        User, on_delete=models.CASCADE,
        related_name='notifications',
    )

    title = models.CharField(max_length=200)
    message = models.TextField()

    type = models.CharField(
        max_length=20, choices=Type.choices,
        default=Type.INFO,
    )

    read = models.BooleanField(default=False)

    clearance = models.ForeignKey(
        Clearance, on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='notifications',
    )

    issue = models.ForeignKey(
        Issue, on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='notifications',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    

class AuditLog(models.Model):
    user = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT,
        related_name='audit_logs',
    )

    action = models.CharField(max_length=100)
    description = models.TextField()
    entity_type = models.CharField(max_length=100)
    entity_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.action} - {self.user.username}'