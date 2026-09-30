from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import Clearance, ClearanceOffice, Issue
from .services import ClearanceService

from accounts.permissions import IsOfficer, IsRegistrar, IsStudent
from .helper_serializer import IssueSerializer
from .serializers import (
    ClearanceCreateSerializer, ClearanceOfficeProcessSerializer, 
    ClearanceOfficeSerializer, ClearanceSerializer, IssueResolveSerializer, 
    OfficerClearanceSerializer, RegistrarClearanceSerializer, RegistrarIssueSerializer
    )


class ClearanceListView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        clearances = (
            request.user.student_profile.clearances
            .select_related(
                'student',
                'student__faculty',
                'student__department',
                'student__section',
                'clearance_type',
                'initiated_by',
                'final_approved_by',
            ).prefetch_related(
                'clearance_offices__office',
                'clearance_offices__assigned_officer',
                'clearance_offices__issues__created_by',
                'clearance_offices__issues__resolved_by',
            )
            .order_by('-initiated_at')
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
                .select_related('clearance', 'office', 'assigned_officer', ).prefetch_related(
                    'issues__created_by',
                    'issues__resolved_by',
                ).get(pk=pk)
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
            issue = (Issue.objects.select_related('clearance_office', 'clearance_office__assigned_officer','created_by', 'resolved_by' 
                                                  ).prefetch_related(
                                                      'clearance_office__issues__created_by',
                                                      'clearance_office__issues__resolved_by',
                                                      ).get(pk=pk) )
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

        response_serializer = IssueSerializer(issue, )

        return Response(response_serializer.data, )
        
class FinalApproveClearanceView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def patch(self, request, pk):
        try:
            clearance = (
                Clearance.objects
                .select_related(
                    'student', 'student__faculty', 'student__department',
                    'student__section', 'clearance_type', 'initiated_by', 'final_approved_by',
                ).prefetch_related(
                    'clearance_offices__office', 'clearance_offices__assigned_officer',
                    'clearance_offices__issues__created_by', 'clearance_offices__issues__resolved_by',
                ).get(pk=pk)
            )
        except Clearance.DoesNotExist:
            raise NotFound('Clearance not found.')

        clearance = ClearanceService.final_approve_clearance(clearance=clearance, registrar=request.user, )

        serializer = ClearanceSerializer(clearance,)

        return Response(serializer.data, )


### OFFICER VIEWS ###
class OfficerClearanceListView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def get(self, request):
        clearances = (
            ClearanceOffice.objects
            .filter(assigned_officer=request.user.staff_profile)
            .select_related(
                'clearance', 'clearance__student', 'clearance__student__faculty',
                'clearance__student__department', 'clearance__student__section',
                'clearance__clearance_type', 'office', 'assigned_officer',
            ).prefetch_related(
                'issues__created_by',
                'issues__resolved_by',
            ).order_by('-clearance__initiated_at')
        )

        serializer = OfficerClearanceSerializer(clearances, many=True, )

        return Response(serializer.data)
    
class OfficerIssueListView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def get(self, request):
        issues = (
            Issue.objects
            .filter(clearance_office__assigned_officer=request.user.staff_profile
            ).select_related(
                'created_by', 'resolved_by', 'clearance_office',
                'clearance_office__office', 'clearance_office__clearance',
            ).order_by('-created_at')
        )

        serializer = IssueSerializer(issues, many=True)

        return Response(serializer.data)
    
class RegistrarClearanceListView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def get(self, request):
        clearances = (
            Clearance.objects
            .select_related(
                'student', 'student__faculty', 'student__department',
                'student__section', 'clearance_type', 'initiated_by', 'final_approved_by',
            ).order_by('-initiated_at')
        )
        
        status_filter = request.query_params.get('status')

        if status_filter:
            clearances = clearances.filter(status=status_filter)

        serializer = RegistrarClearanceSerializer(clearances, many=True, )

        return Response(serializer.data)
    

class RegistrarIssueListView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def get(self, request):
        issues = (
            Issue.objects
            .select_related(
                'created_by',  'resolved_by',
                'clearance_office',
                'clearance_office__office',
                'clearance_office__clearance',
                'clearance_office__clearance__student',
                'clearance_office__clearance__student__faculty',
                'clearance_office__clearance__student__department',
                'clearance_office__clearance__student__section',
                'clearance_office__clearance__clearance_type',
            )
            .order_by('-created_at')
        )

        serializer = RegistrarIssueSerializer(issues, many=True)
        return Response(serializer.data)
    