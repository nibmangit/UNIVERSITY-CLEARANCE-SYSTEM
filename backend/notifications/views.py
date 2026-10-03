from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError

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