from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsStudent
from .serializers import ClearanceSerializer


class ClearanceListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        clearances = (
            request.user.student_profile.clearances
            .select_related('clearance_type')
            .prefetch_related(
                'clearance_offices__office',
                'clearance_offices__assigned_officer',
            ).order_by('-initiated_at')
        )

        serializer = ClearanceSerializer(clearances, many=True)

        return Response(serializer.data)