from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsRegistrar, IsStudent
from .serializers import ClearanceCreateSerializer, ClearanceSerializer


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
    

class ClearanceCreateView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def post(self, request):
        serializer = ClearanceCreateSerializer(
            data=request.data,
            context={'request': request},
        )

        serializer.is_valid(raise_exception=True)

        clearance = serializer.save()

        response_serializer = ClearanceSerializer(clearance)

        return Response(response_serializer.data, status=201, )