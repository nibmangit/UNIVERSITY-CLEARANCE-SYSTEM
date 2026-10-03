from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound, PermissionDenied

from .models import Clearance, ClearanceOffice, Issue
from accounts.models import Student
from .services import ClearanceService

from accounts.permissions import IsOfficer, IsRegistrar, IsStudent
from .helper_serializer import IssueSerializer
from .serializers import ClearanceSerializer, OfficerClearanceSerializer, RegistrarClearanceSerializer, RegistrarClearanceSerializer, RegistrarIssueSerializer, RegistrarIssueSerializer 

ISSUE_RELATED = [
    'created_by', 'created_by__staff_profile',
    'resolved_by', 'resolved_by__staff_profile',
    'clearance_office', 'clearance_office__office',
    'clearance_office__clearance',
    'clearance_office__clearance__student',
    'clearance_office__clearance__student__faculty',
    'clearance_office__clearance__student__department',
    'clearance_office__clearance__student__section',
]

class OfficerDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsOfficer]

    def get(self, request):
        officer = request.user.staff_profile

        assigned_tasks = ClearanceOffice.objects.filter(assigned_officer=officer )

        summary = {
            'total_assigned': assigned_tasks.count(),
            'pending': assigned_tasks.filter(status=ClearanceOffice.Status.PENDING ).count(),
            'cleared': assigned_tasks.filter(status=ClearanceOffice.Status.CLEARED).count(),
            'flagged': assigned_tasks.filter(status=ClearanceOffice.Status.FLAGGED).count(),
            'open_issues': Issue.objects.filter(
                clearance_office__assigned_officer=officer,
                status=Issue.Status.OPEN,
            ).count(),
        }

        recent_tasks = (
            assigned_tasks
            .select_related(
                'clearance', 'clearance__student', 'clearance__student__faculty',
                'clearance__student__department', 'clearance__student__section',
                'clearance__clearance_type', 'office', 'assigned_officer',
            ).prefetch_related(
                'issues__created_by', 'issues__resolved_by',
            ).order_by('-clearance__initiated_at')[:5]
        )

        recent_issues = (
            Issue.objects
            .filter(
                clearance_office__assigned_officer=officer,
                status=Issue.Status.OPEN,
            )
            .select_related(*ISSUE_RELATED)
            .order_by('-created_at')[:5]
        )

        tasks_serializer = OfficerClearanceSerializer(recent_tasks, many=True )

        issues_serializer = RegistrarIssueSerializer(recent_issues, many=True)

        return Response({
            'summary': summary,
            'recent_tasks': tasks_serializer.data,
            'recent_issues': issues_serializer.data,
        })
        
        
class RegistrarDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def get(self, request):
        total_students = Student.objects.count()

        clearances = Clearance.objects.all()

        summary = {
            'total_students': total_students,
            'total_clearances': clearances.count(),
            'initiated': clearances.filter(status=Clearance.Status.INITIATED ).count(),
            'in_progress': clearances.filter(status=Clearance.Status.IN_PROGRESS).count(),
            'pending_registrar': clearances.filter(status=Clearance.Status.PENDING_REGISTRAR).count(),
            'completed': clearances.filter(status=Clearance.Status.COMPLETED).count(),
            'cancelled': clearances.filter(status=Clearance.Status.CANCELLED).count(),
            'open_issues': Issue.objects.filter(status=Issue.Status.OPEN ).count(),
        }

        recent_clearances = (
            Clearance.objects
            .select_related(
                'student', 'student__faculty', 'student__department', 'student__section', 'clearance_type',
                'initiated_by', 'final_approved_by',
            )
            .prefetch_related('clearance_offices')                       # NEW
            .order_by('-initiated_at')[:5]
        )

        recent_issues = (
            Issue.objects
            .filter(status=Issue.Status.OPEN)
            .select_related(
                'created_by', 'resolved_by', 'clearance_office', 'clearance_office__office',
                'clearance_office__clearance', 'clearance_office__clearance__student',
                'clearance_office__clearance__student__faculty', 'clearance_office__clearance__student__department',
                'clearance_office__clearance__student__section', 'clearance_office__clearance__clearance_type',
            ).order_by('-created_at')[:5]
        )

        clearances_serializer = RegistrarClearanceSerializer(recent_clearances, many=True, )

        issues_serializer = RegistrarIssueSerializer(recent_issues, many=True, )

        return Response({
            'summary': summary,
            'recent_clearances': clearances_serializer.data,
            'recent_issues': issues_serializer.data,
        })
        

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        student = request.user.student_profile
        clearances = Clearance.objects.filter(student=student )
        clearance_offices = ClearanceOffice.objects.filter(clearance__student=student )

        summary = {
            'total_clearances': clearances.count(),
            'completed': clearances.filter(status=Clearance.Status.COMPLETED).count(),
            'pending': clearance_offices.filter(status=ClearanceOffice.Status.PENDING ).count(),
            'flagged': clearance_offices.filter(status=ClearanceOffice.Status.FLAGGED).count(),
        }

        active_clearance = (
            clearances
            .filter(
                status__in=[
                    Clearance.Status.INITIATED,
                    Clearance.Status.IN_PROGRESS,
                    Clearance.Status.PENDING_REGISTRAR,
                ]
            ).select_related(
                'student', 'student__faculty', 'student__department', 'student__section',
                'clearance_type', 'initiated_by', 'final_approved_by',
            ).prefetch_related(
                'clearance_offices__office', 'clearance_offices__assigned_officer',
                'clearance_offices__issues__created_by', 'clearance_offices__issues__resolved_by',
            ).order_by('-initiated_at').first()
        )

        recent_clearances = (
            clearances
            .select_related(
                'student', 'student__faculty', 'student__department', 'student__section',
                'clearance_type', 'initiated_by', 'final_approved_by',
            )
            .prefetch_related(                                                  # NEW
                'clearance_offices__office', 'clearance_offices__assigned_officer',
                'clearance_offices__issues__created_by', 'clearance_offices__issues__resolved_by',
            )
            .order_by('-initiated_at')[:5]
        )

        recent_issues = (
            Issue.objects
            .filter(
                clearance_office__clearance__student=student,
                status=Issue.Status.OPEN,
            )
            .select_related(*ISSUE_RELATED)
            .order_by('-created_at')[:5]
        )
        active_clearance_serializer = ClearanceSerializer(active_clearance ) if active_clearance else None
        recent_clearances_serializer = ClearanceSerializer(recent_clearances, many=True, )
        recent_issues_serializer = RegistrarIssueSerializer(recent_issues, many=True)

        return Response({
            'summary': summary,
            'active_clearance': (
                active_clearance_serializer.data
                if active_clearance_serializer
                else None
            ),
            'recent_clearances': recent_clearances_serializer.data,
            'recent_issues': recent_issues_serializer.data,
        })
        
