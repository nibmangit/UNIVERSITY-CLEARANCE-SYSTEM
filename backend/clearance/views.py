from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import ClearanceOffice, Issue
from .services import ClearanceService

from accounts.permissions import IsOfficer, IsRegistrar, IsStudent
from .serializers import ClearanceCreateSerializer, ClearanceOfficeProcessSerializer, ClearanceOfficeProcessSerializer, ClearanceOfficeSerializer, ClearanceSerializer, IssueResolveSerializer


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
    
class ClearanceOfficeProcessView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def patch(self, request, pk):
        try:
            clearance_office = (
                ClearanceOffice.objects
                .select_related('clearance', 'office', 'assigned_officer', ).get(pk=pk)
            )
        except ClearanceOffice.DoesNotExist:
            raise NotFound('Clearance office not found.')

        serializer = ClearanceOfficeProcessSerializer(data=request.data )
        serializer.is_valid(raise_exception=True)

        clearance_office = ClearanceService.process_office(
            clearance_office=clearance_office,
            officer=request.user,
            status=serializer.validated_data['status'],
            notes=serializer.validated_data.get('notes', ''),
            issue_reason=serializer.validated_data.get('issue_reason', ''),
            issue_description=serializer.validated_data.get('issue_description', ''),
        )

        response_serializer =   ClearanceOfficeSerializer(clearance_office )

        return Response(response_serializer.data)

class ResolveIssueView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def patch(self, request, pk):
        try:
            issue = (Issue.objects.select_related('clearance_office', 'clearance_office__assigned_officer', ).get(pk=pk) )
        except Issue.DoesNotExist:
            raise NotFound('Issue not found.')

        if ( issue.clearance_office.assigned_officer_id
             != request.user.staff_profile.id ):
            raise PermissionDenied('You are not assigned to this issue.' )

        serializer = IssueResolveSerializer(data=request.data )
        serializer.is_valid(raise_exception=True)

        issue = ClearanceService.resolve_issue(
            issue=issue,
            user=request.user,
            resolution_note=serializer.validated_data['resolution_note' ],
        )

        return Response({
            'id': issue.id,
            'status': issue.status,
            'resolution_note': issue.resolution_note,
            'resolved_by': issue.resolved_by.id,
            'resolved_at': issue.resolved_at,
            'clearance_office_status': (
                issue.clearance_office.status
            ),
        })