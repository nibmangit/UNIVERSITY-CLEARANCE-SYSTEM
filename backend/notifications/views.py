from datetime import timedelta

from django.db.models import Q, Count
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.exceptions import ValidationError, NotFound, PermissionDenied
from rest_framework.generics import ListAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from .models import AuditLog
from .serializers import AuditLogSerializer

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)

        if request.query_params.get('unread', '').lower() in ('true', '1'):
            notifications = notifications.filter(is_read=False)

        type_filter = request.query_params.get('type')
        if type_filter:
            type_filter = type_filter.upper()
            if type_filter not in Notification.Type.values:
                raise ValidationError(
                    {'type': f'Must be one of: {", ".join(Notification.Type.values)}.'}
                )
            notifications = notifications.filter(type=type_filter)

        serializer = NotificationSerializer(
            notifications.order_by('-created_at'),
            many=True,
        )

        return Response(serializer.data)
    
class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk)
        except Notification.DoesNotExist:
            raise NotFound('Notification not found.')

        if notification.user_id != request.user.id:
            raise PermissionDenied('You cannot modify this notification.' )

        notification.is_read = True
        notification.save(update_fields=['is_read'])

        serializer = NotificationSerializer(notification)

        return Response(serializer.data)
    
class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response({
            'detail': 'All notifications marked as read.',
            'updated_count': updated_count,
        })
        
class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()

        return Response({'count': count})
    

class NotificationDeleteView(APIView):
    """DELETE /notifications/<id>/ deletes one of your own notifications."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        # Filtering by user means someone else's notification looks like it does not exist.
        deleted, _ = Notification.objects.filter(pk=pk, user=request.user).delete()

        if not deleted:
            raise NotFound('Notification not found.')

        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationClearReadView(APIView):
    """DELETE /notifications/clear-read/ deletes all your read notifications. Unread ones are kept."""
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        deleted, _ = Notification.objects.filter(user=request.user, is_read=True).delete()

        return Response({'deleted_count': deleted})
    
class AuditLogPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class AuditLogListView(ListAPIView):
    """
    GET /notifications/audit-logs/  (admin only). Newest first, paginated: { count, next, previous, results }.
    Filters: ?search=  ?action=  ?entity_type=  ?role=  ?date_from=YYYY-MM-DD  ?date_to=YYYY-MM-DD
    """
    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = AuditLogSerializer
    pagination_class = AuditLogPagination

    def get_queryset(self):
        params = self.request.query_params

        logs = AuditLog.objects.select_related('user', 'user__staff_profile', 'user__student_profile')

        search = params.get('search', '').strip()
        if search:
            match = (
                Q(description__icontains=search)
                | Q(action__icontains=search)
                | Q(entity_type__icontains=search)
                | Q(user__university_id__icontains=search)
                | Q(user__username__icontains=search)
                | Q(user__staff_profile__full_name__icontains=search)
                | Q(user__student_profile__full_name__icontains=search)
            )
            # A number also matches the record it refers to (for example clearance 12).
            if search.isdigit() and len(search) <= 9:
                match |= Q(entity_id=int(search))
            logs = logs.filter(match)

        if params.get('action'):
            logs = logs.filter(action=params['action'])

        if params.get('entity_type'):
            logs = logs.filter(entity_type=params['entity_type'])

        if params.get('role'):
            logs = logs.filter(user__role=params['role'].upper())

        for name, lookup in (('date_from', 'created_at__date__gte'), ('date_to', 'created_at__date__lte')):
            value = params.get(name)
            if not value:
                continue

            try:
                parsed = parse_date(value)
            except ValueError:
                parsed = None

            if parsed is None:
                raise ValidationError({name: ['Use YYYY-MM-DD.']})

            logs = logs.filter(**{lookup: parsed})

        return logs.order_by('-created_at', '-id')


class AuditLogMetaView(APIView):
    """GET /notifications/audit-logs/meta/: filter options, tile numbers and the last 7 days by action."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        logs = AuditLog.objects.all()
        last_week = logs.filter(created_at__gte=timezone.now() - timedelta(days=7))

        by_action = last_week.values('action').annotate(count=Count('id')).order_by('-count', 'action')

        return Response({
            'actions': sorted(logs.values_list('action', flat=True).distinct()),
            'entity_types': sorted(logs.values_list('entity_type', flat=True).distinct()),
            'summary': {
                'total': logs.count(),
                'today': logs.filter(created_at__date=timezone.localdate()).count(),
                'last_7_days': last_week.count(),
                'users': logs.values('user').distinct().count(),
            },
            'by_action': [{'action': row['action'], 'count': row['count']} for row in by_action],
        })