from django.utils import timezone

from django.db import transaction
from rest_framework.exceptions import ValidationError

from accounts.models import Student
from .models import (
    Clearance,
    ClearanceOffice,
    ClearanceType,
    Issue,
    Office,
    OfficeAssignment,
)


class ClearanceService:

    REQUIRED_OFFICE_CODES = [
        'ADVISOR',
        'LIBRARY',
        'DORMITORY',
        'SPORT',
        'CAFE',
        'FACULTY_STORE',
    ]

    @staticmethod
    def _get_assigned_officer(*, office, student):
        assignments = OfficeAssignment.objects.filter(
            office=office,
            is_active=True,
        ).select_related('staff')

        if office.code == 'ADVISOR':
            assignment = assignments.filter(
                faculty=student.faculty,
                department=student.department,
                section=student.section,
            ).first()

        elif office.code == 'FACULTY_STORE':
            assignment = assignments.filter(
                faculty=student.faculty,
                department__isnull=True,
                section__isnull=True,
            ).first()

        else:
            assignment = assignments.filter(
                faculty__isnull=True,
                department__isnull=True,
                section__isnull=True,
            ).first()

        if assignment is None:
            raise ValidationError(
                f'No active officer assignment found for {office.name}.'
            )

        return assignment.staff

    @staticmethod
    @transaction.atomic
    def create_clearance(
        *,
        student: Student,
        clearance_type: ClearanceType,
        initiated_by,
    ):
        active_statuses = [
            Clearance.Status.INITIATED,
            Clearance.Status.IN_PROGRESS,
            Clearance.Status.PENDING_REGISTRAR,
        ]

        already_active = Clearance.objects.filter(
            student=student,
            clearance_type=clearance_type,
            status__in=active_statuses,
        ).exists()

        if already_active:
            raise ValidationError('This student already has an active clearance of this type.'  )

        offices = Office.objects.filter(code__in=ClearanceService.REQUIRED_OFFICE_CODES, is_active=True, )
        office_map = {office.code: office for office in offices }

        missing_offices = [
            code
            for code in ClearanceService.REQUIRED_OFFICE_CODES
            if code not in office_map
        ]

        if missing_offices:
            raise ValidationError(
                f'Required office(s) not found or inactive: '
                f'{", ".join(missing_offices)}.'
            )

        clearance = Clearance.objects.create(
            student=student,
            clearance_type=clearance_type,
            initiated_by=initiated_by,
            status=Clearance.Status.INITIATED,
        )

        for code in ClearanceService.REQUIRED_OFFICE_CODES:
            office = office_map[code]

            assigned_officer = (
                ClearanceService._get_assigned_officer(
                    office=office,
                    student=student,
                )
            )

            ClearanceOffice.objects.create(
                clearance=clearance,
                office=office,
                assigned_officer=assigned_officer,
            )

        return clearance
    
    @staticmethod
    @transaction.atomic
    def process_office(*, clearance_office: ClearanceOffice, officer, status, notes='', issue_reason='', issue_description=''):
        if clearance_office.assigned_officer_id != officer.staff_profile.id:
            raise ValidationError('You are not assigned to this clearance office.' )

        if clearance_office.status != ClearanceOffice.Status.PENDING:
            raise ValidationError('This office has already been processed.' )

        if status not in [ClearanceOffice.Status.CLEARED, ClearanceOffice.Status.FLAGGED, ]:
            raise ValidationError('Invalid office status.' )

        clearance_office.status = status
        clearance_office.notes = notes
        clearance_office.reviewed_at = timezone.now()
        clearance_office.save(update_fields=[ 'status', 'notes', 'reviewed_at', ] )
        
        if status == ClearanceOffice.Status.FLAGGED:
            if not issue_reason:
                raise ValidationError('Issue reason is required when flagging an office.')

            if not issue_description:
                raise ValidationError('Issue description is required when flagging an office.' )

            Issue.objects.create(
                clearance_office=clearance_office,
                reason=issue_reason,
                description=issue_description,
                created_by=officer,
            )
            
        ClearanceService.update_clearance_status(clearance_office.clearance )

        return clearance_office
    
    @staticmethod
    @transaction.atomic
    def resolve_issue(*, issue: Issue, user, resolution_note, ):
        if issue.status != Issue.Status.OPEN:
            raise ValidationError('This issue is not open.' )

        if not resolution_note:
            raise ValidationError('Resolution note is required.' )

        issue.status = Issue.Status.RESOLVED
        issue.resolved_by = user
        issue.resolution_note = resolution_note
        issue.resolved_at = timezone.now()

        issue.save(
            update_fields=['status', 'resolved_by', 'resolution_note', 'resolved_at', ] )

        issue.clearance_office.status = (ClearanceOffice.Status.PENDING )
        issue.clearance_office.notes = ''
        issue.clearance_office.reviewed_at = None

        issue.clearance_office.save(
            update_fields=['status', 'notes', 'reviewed_at', ] )

        return issue
    
    @staticmethod
    def update_clearance_status(clearance):
        offices = clearance.clearance_offices.all()

        if not offices.exists():
            return clearance

        if all(
            office.status == ClearanceOffice.Status.CLEARED
            for office in offices
        ):
            clearance.status = Clearance.Status.PENDING_REGISTRAR
            clearance.submitted_at = timezone.now()

            clearance.save(update_fields=[ 'status', 'submitted_at', ] )

        elif any(
            office.status in [
                ClearanceOffice.Status.CLEARED,
                ClearanceOffice.Status.FLAGGED,
            ]
            for office in offices
        ):
            if clearance.status == Clearance.Status.INITIATED:
                clearance.status = Clearance.Status.IN_PROGRESS

                clearance.save(update_fields=['status']  )

        return clearance