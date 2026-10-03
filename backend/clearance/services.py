from django.utils import timezone

from django.db import transaction
from notifications.models import Notification
from rest_framework.exceptions import ValidationError

from accounts.models import Student, User
from notifications.services import AuditLogService, NotificationService
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
    @transaction.atomic
    def create_clearance(*, student: Student, clearance_type: ClearanceType, initiated_by, reason='' ):
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
            reason=reason, 
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
        AuditLogService.log(
            user=initiated_by,
            action='REGISTRAR_INITIATED_CLEARANCE',
            description=(
                f'Clearance initiated for student '
                f'{student.student_id}.'
            ),
            entity_type='Clearance',
            entity_id=clearance.id,
        )
        
        NotificationService.create(
            user=student.user,
            title='Clearance Initiated',
            message=(
                f'Your {clearance_type.name} clearance has been initiated. '
                f'Please log in to track its progress.'
            ),
            notification_type=Notification.Type.CLEARANCE,
            clearance=clearance,
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
            
            AuditLogService.log(
                user=officer,
                action='OFFICER_FLAGGED_OFFICE',
                description=(
                    f'{officer.username} flagged the '
                    f'{clearance_office.office.name} office.'
                ),
                entity_type='ClearanceOffice',
                entity_id=clearance_office.id,
            )
            
            NotificationService.create(
                user=clearance_office.clearance.student.user,
                title='Clearance Issue',
                message=(
                    f'{clearance_office.office.name} has flagged an issue '
                    f'with your clearance: {issue_reason}.'
                ),
                notification_type=Notification.Type.ISSUE,
                clearance=clearance_office.clearance,
            )
            
            
        elif status == ClearanceOffice.Status.CLEARED:
            AuditLogService.log(
                user=officer,
                action='OFFICER_CLEARED_OFFICE',
                description=(
                    f'{officer.username} cleared the '
                    f'{clearance_office.office.name} office.'
                ),
                entity_type='ClearanceOffice',
                entity_id=clearance_office.id,
            )
            
            NotificationService.create(
                user=clearance_office.clearance.student.user,
                title='Office Cleared',
                message=(
                    f'{clearance_office.office.name} has cleared your '
                    f'{clearance_office.clearance.clearance_type.name} clearance.'
                ),
                notification_type=Notification.Type.CLEARANCE,
                clearance=clearance_office.clearance,
            )
            
        ClearanceService.update_clearance_status(clearance_office.clearance )

        return clearance_office
    
    @staticmethod
    @transaction.atomic
    def resolve_issue(*, issue: Issue, user, resolution_note, ):
        if issue.status != Issue.Status.OPEN:
            raise ValidationError('This issue is not open.' )
        
        if issue.clearance_office.assigned_officer_id != user.staff_profile.id:
            raise ValidationError('You are not assigned to this issue.')

        if not resolution_note:
            raise ValidationError('Resolution note is required.' )

        issue.status = Issue.Status.RESOLVED
        issue.resolved_by = user
        issue.resolution_note = resolution_note
        issue.resolved_at = timezone.now()

        issue.save(update_fields=['status', 'resolved_by', 'resolution_note', 'resolved_at', ] )
        
        AuditLogService.log(
            user=user,
            action='OFFICER_RESOLVED_ISSUE',
            description=(
                f'Issue resolved for '
                f'{issue.clearance_office.office.name}.'
            ),
            entity_type='Issue',
            entity_id=issue.id,
        )
        
        NotificationService.create(
            user=issue.clearance_office.clearance.student.user,
            title='Issue Resolved',
            message=(
                f'The issue raised by '
                f'{issue.clearance_office.office.name} has been resolved. '
                f'The office can now process your clearance again.'
            ),
            notification_type=Notification.Type.ISSUE,
            clearance=issue.clearance_office.clearance,
            issue=issue,
        )

        issue.clearance_office.status = (ClearanceOffice.Status.PENDING )
        issue.clearance_office.notes = ''
        issue.clearance_office.reviewed_at = None

        issue.clearance_office.save(update_fields=['status', 'notes', 'reviewed_at', ] )
        

        return issue
    
    
    @staticmethod
    @transaction.atomic
    def final_approve_clearance(*, clearance: Clearance, registrar, ):
        if registrar.role != registrar.Role.REGISTRAR:
            raise ValidationError('Only a registrar can approve a clearance.')

        if clearance.status != Clearance.Status.PENDING_REGISTRAR:
            raise ValidationError('This clearance is not pending registrar approval.' )

        offices = clearance.clearance_offices.all()

        if not offices.exists():
            raise ValidationError('This clearance has no office records.' )

        if not all(
            office.status == ClearanceOffice.Status.CLEARED
            for office in offices
        ):
            raise ValidationError('All offices must be cleared before final approval.' )

        now = timezone.now()

        clearance.status = Clearance.Status.COMPLETED
        clearance.final_approved_by = registrar
        clearance.final_approved_at = now
        clearance.completed_at = now

        clearance.save(update_fields=['status', 'final_approved_by', 'final_approved_at', 'completed_at', ] )
        
        AuditLogService.log(
            user=registrar,
            action='REGISTRAR_FINAL_APPROVAL',
            description=(
                f'Final approval completed for clearance '
                f'{clearance.id}.'
            ),
            entity_type='Clearance',
            entity_id=clearance.id,
        )
        
        NotificationService.create(
            user=clearance.student.user,
            title='Clearance Completed',
            message=(
                f'Your {clearance.clearance_type.name} clearance '
                f'has been completed and approved by the registrar.'
            ),
            notification_type=Notification.Type.CLEARANCE,
            clearance=clearance,
        )


        return clearance
    
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
            ClearanceService.create_notification_for_status_update(clearance)

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
    
    @staticmethod
    def create_notification_for_status_update(clearance):
        NotificationService.create(
            user=clearance.student.user,
            title='Clearance Ready for Final Approval',
            message=(
                'All required offices have cleared your '
                'clearance. It is now waiting for final '
                'registrar approval.'
            ),
            notification_type=Notification.Type.CLEARANCE,
            clearance=clearance,
        )

        registrar_users = User.objects.filter(
            role=User.Role.REGISTRAR,
            is_active=True,
        )

        for registrar in registrar_users:
            NotificationService.create(
                user=registrar,
                title='Clearance Ready for Approval',
                message=(
                    f'Clearance for student '
                    f'{clearance.student.student_id} is ready '
                    f'for final approval.'
                ),
                notification_type=Notification.Type.CLEARANCE,
                clearance=clearance,
            )
    
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
