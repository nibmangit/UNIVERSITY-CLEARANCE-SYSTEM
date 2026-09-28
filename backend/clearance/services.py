from django.db import transaction
from rest_framework.exceptions import ValidationError

from accounts.models import Student
from .models import (
    Clearance,
    ClearanceOffice,
    ClearanceType,
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
            raise ValidationError(
                'This student already has an active clearance '
                'of this type.'
            )

        offices = Office.objects.filter(
            code__in=ClearanceService.REQUIRED_OFFICE_CODES,
            is_active=True,
        )

        office_map = {
            office.code: office
            for office in offices
        }

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