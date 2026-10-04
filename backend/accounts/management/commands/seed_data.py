from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import (
    Department,
    Faculty,
    Section,
    Staff,
    Student,
    User,
)
from clearance.models import (
    Clearance,
    ClearanceOffice,
    ClearanceType,
    Issue,
    Office,
    OfficeAssignment,
)
from notifications.models import Notification, AuditLog


SEED_PASSWORD = 'TestPass123!'


def parse_datetime(value):
    if value is None:
        return None

    return datetime.fromisoformat(value)


class Command(BaseCommand):
    help = 'Reset and seed the database with project mock data.'

    @transaction.atomic
    def handle(self, *args, **options):

        self.stdout.write('Clearing existing project data...')

        # Delete in dependency order.
        Notification.objects.all().delete()
        AuditLog.objects.all().delete()
        Issue.objects.all().delete()
        ClearanceOffice.objects.all().delete()
        Clearance.objects.all().delete()
        ClearanceType.objects.all().delete()
        OfficeAssignment.objects.all().delete()
        Office.objects.all().delete()
        Student.objects.all().delete()
        Staff.objects.all().delete()
        Section.objects.all().delete()
        Department.objects.all().delete()
        Faculty.objects.all().delete()
        User.objects.all().delete()

        self.stdout.write('Creating users...')

        users_data = [
            (1, 'BDU00123', 'STUDENT', 'Abebe', 'Kebede'),
            (2, 'BDU00124', 'STUDENT', 'Mekdes', 'Alemu'),
            (3, 'BDU00125', 'STUDENT', 'Dawit', 'Tadesse'),
            (101, 'OFF001', 'OFFICER', 'Hana', 'Alemu'),
            (102, 'OFF002', 'OFFICER', 'Samuel', 'Bekele'),
            (103, 'OFF003', 'OFFICER', 'Mimi', 'Worku'),
            (201, 'REG001', 'REGISTRAR', 'Kebede', 'Tadesse'),
            (301, 'ADM001', 'ADMIN', 'Dawit', 'Bekele'),
        ]

        users = {}

        for user_id, username, role, first_name, last_name in users_data:
            user = User(
                id=user_id,
                username=username,
                university_id=username,
                role=role,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_password(SEED_PASSWORD)
            user.save()
            users[user_id] = user

        self.stdout.write('Creating faculties...')

        faculties_data = [
            (1, 'Faculty of Computing', 'FC'),
            (2, 'Faculty of Engineering', 'FE'),
            (3, 'Faculty of Business', 'FB'),
        ]

        faculties = {}

        for faculty_id, name, code in faculties_data:
            faculties[faculty_id] = Faculty.objects.create(
                id=faculty_id,
                name=name,
                code=code,
                is_active=True,
            )

        self.stdout.write('Creating departments...')

        departments_data = [
            (1, 1, 'Software Engineering', 'SE'),
            (2, 1, 'Computer Science', 'CS'),
            (3, 2, 'Electrical Engineering', 'EE'),
            (4, 3, 'Accounting', 'ACC'),
        ]

        departments = {}

        for department_id, faculty_id, name, code in departments_data:
            departments[department_id] = Department.objects.create(
                id=department_id,
                faculty=faculties[faculty_id],
                name=name,
                code=code,
                is_active=True,
            )

        self.stdout.write('Creating sections...')

        sections_data = [
            (1, 1, 'Section A', 3),
            (2, 1, 'Section B', 3),
            (3, 2, 'Section A', 4),
            (4, 3, 'Section A', 4),
            (5, 4, 'Section A', 4),
        ]

        sections = {}

        for section_id, department_id, name, year in sections_data:
            sections[section_id] = Section.objects.create(
                id=section_id,
                department=departments[department_id],
                name=name,
                year=year,
                is_active=True,
            )

        self.stdout.write('Creating students...')

        students_data = [
            (
                1, 1, 'BDU00123', 'Abebe Kebede',
                1, 1, 1, 3,
                'abebe@bdu.edu.et', '+251911111111'
            ),
            (
                2, 2, 'BDU00124', 'Mekdes Alemu',
                1, 2, 3, 4,
                'mekdes@bdu.edu.et', '+251922222222'
            ),
            (
                3, 3, 'BDU00125', 'Dawit Tadesse',
                2, 3, 4, 4,
                'dawit@bdu.edu.et', '+251933333333'
            ),
        ]

        students = {}

        for (
            student_id,
            user_id,
            student_number,
            full_name,
            faculty_id,
            department_id,
            section_id,
            year,
            email,
            phone,
        ) in students_data:

            students[student_id] = Student.objects.create(
                id=student_id,
                user=users[user_id],
                student_id=student_number,
                full_name=full_name,
                faculty=faculties[faculty_id],
                department=departments[department_id],
                section=sections[section_id],
                year=year,
                email=email,
                phone=phone,
            )

        self.stdout.write('Creating staff...')

        staff_data = [
            (
                1, 101, 'EMP001', 'Hana Alemu',
                'hana@bdu.edu.et', '+251911000001'
            ),
            (
                2, 102, 'EMP002', 'Samuel Bekele',
                'samuel@bdu.edu.et', '+251911000002'
            ),
            (
                3, 103, 'EMP003', 'Mimi Worku',
                'mimi@bdu.edu.et', '+251911000003'
            ),
            (
                4, 201, 'REG001', 'Kebede Tadesse',
                'kebede@bdu.edu.et', '+251911000004'
            ),
            (
                5, 301, 'ADM001', 'Dawit Bekele',
                'dawit.b@bdu.edu.et', '+251911000005'
            ),
        ]

        staff_members = {}

        for (
            staff_id,
            user_id,
            employee_id,
            full_name,
            email,
            phone,
        ) in staff_data:

            staff_members[staff_id] = Staff.objects.create(
                id=staff_id,
                user=users[user_id],
                employee_id=employee_id,
                full_name=full_name,
                email=email,
                phone=phone,
                is_active=True,
            )

        self.stdout.write('Creating offices...')

        offices_data = [
            (1, 'Advisor', 'ADVISOR', 'Academic advisor clearance.'),
            (2, 'Library', 'LIBRARY', 'Library clearance.'),
            (3, 'Dormitory', 'DORMITORY', 'Dormitory clearance.'),
            (4, 'Sport Office', 'SPORT', 'Sport office clearance.'),
            (5, 'Café', 'CAFE', 'Café clearance.'),
            (
                6,
                'Faculty Store',
                'FACULTY_STORE',
                'Faculty store clearance.',
            ),
        ]

        offices = {}

        for office_id, name, code, description in offices_data:
            offices[office_id] = Office.objects.create(
                id=office_id,
                name=name,
                code=code,
                description=description,
                is_active=True,
            )

        self.stdout.write('Creating office assignments...')

        assignments_data = [
            (1, 1, 1, 1, 1, 1),
            (2, 2, 1, 1, 2, 3),
            (3, 3, 1, 2, 3, 4),
            (4, 1, 2, None, None, None),
            (5, 2, 3, None, None, None),
            (6, 3, 4, None, None, None),
            (7, 1, 5, None, None, None),
            (8, 2, 6, 1, None, None),
            (9, 3, 6, 2, None, None),
        ]

        for (
            assignment_id,
            staff_id,
            office_id,
            faculty_id,
            department_id,
            section_id,
        ) in assignments_data:

            OfficeAssignment.objects.create(
                id=assignment_id,
                staff=staff_members[staff_id],
                office=offices[office_id],
                faculty=(
                    faculties[faculty_id]
                    if faculty_id
                    else None
                ),
                department=(
                    departments[department_id]
                    if department_id
                    else None
                ),
                section=(
                    sections[section_id]
                    if section_id
                    else None
                ),
                is_active=True,
            )

        self.stdout.write('Creating clearance types...')

        clearance_types_data = [
            (
                1,
                'End of Year',
                'Clearance at the end of an academic year.',
            ),
            (
                2,
                'Withdrawal',
                'Clearance for students withdrawing.',
            ),
            (
                3,
                'Graduation',
                'Final clearance before graduation.',
            ),
            (
                4,
                'Other',
                'Other clearance purposes.',
            ),
        ]

        clearance_types = {}

        for type_id, name, description in clearance_types_data:
            clearance_types[type_id] = ClearanceType.objects.create(
                id=type_id,
                name=name,
                description=description,
                is_active=True,
            )

        self.stdout.write('Creating clearances...')

        clearances_data = [
            (
                101,
                1,
                1,
                'IN_PROGRESS',
                4,
                '2026-09-15T09:30:00',
                '2026-09-15T10:15:00',
                None,
                None,
                None,
            ),
            (
                102,
                2,
                3,
                'PENDING_REGISTRAR',
                4,
                '2026-09-10T09:00:00',
                '2026-09-10T10:00:00',
                None,
                None,
                None,
            ),
            (
                103,
                3,
                3,
                'COMPLETED',
                4,
                '2026-08-20T09:00:00',
                '2026-08-20T10:00:00',
                4,
                '2026-08-25T14:00:00',
                '2026-08-25T14:00:00',
            ),
        ]

        clearances = {}

        for (
            clearance_id,
            student_id,
            type_id,
            status,
            initiated_by,
            initiated_at,
            submitted_at,
            approved_by,
            approved_at,
            completed_at,
        ) in clearances_data:
            
            staff_initiator = staff_members.get(initiated_by)
            user_who_initiated = staff_initiator.user if staff_initiator else None
            
            staff_approver = staff_members.get(approved_by) if approved_by else None
            user_who_approved = staff_approver.user if staff_approver else None

            clearance = Clearance.objects.create(
                id=clearance_id,
                student=students[student_id],
                clearance_type=clearance_types[type_id],
                status=status,
                initiated_by=user_who_initiated,
                initiated_at=parse_datetime(initiated_at),
                submitted_at=parse_datetime(submitted_at),
                final_approved_by=user_who_approved,
                final_approved_at=parse_datetime(approved_at),
                completed_at=parse_datetime(completed_at),
            )

            clearances[clearance_id] = clearance

        self.stdout.write('Creating clearance-office records...')

        clearance_offices_data = [
            (
                1001, 101, 1, 1, 'CLEARED',
                'Student cleared by advisor.',
                '2026-09-16T09:00:00'
            ),
            (
                1002, 101, 2, 1, 'CLEARED',
                'No outstanding library materials.',
                '2026-09-16T10:00:00'
            ),
            (
                1003, 101, 3, 2, 'FLAGGED',
                None,
                '2026-09-16T11:00:00'
            ),
            (
                1004, 101, 4, 3, 'PENDING',
                None,
                None
            ),
            (
                1005, 101, 5, 1, 'PENDING',
                None,
                None
            ),
            (
                1006, 101, 6, 2, 'PENDING',
                None,
                None
            ),
            (
                2001, 102, 1, 2, 'CLEARED',
                'Advisor clearance completed.',
                '2026-09-11T09:00:00'
            ),
            (
                2002, 102, 2, 1, 'CLEARED',
                'Library clearance completed.',
                '2026-09-11T10:00:00'
            ),
            (
                2003, 102, 3, 2, 'CLEARED',
                'Dormitory clearance completed.',
                '2026-09-11T11:00:00'
            ),
            (
                2004, 102, 4, 3, 'CLEARED',
                'Sport clearance completed.',
                '2026-09-12T09:00:00'
            ),
            (
                2005, 102, 5, 1, 'CLEARED',
                'No outstanding café balance.',
                '2026-09-12T10:00:00'
            ),
            (
                2006, 102, 6, 2, 'CLEARED',
                'Faculty store clearance completed.',
                '2026-09-12T11:00:00'
            ),
            (
                3001, 103, 1, 3, 'CLEARED',
                'Advisor clearance completed.',
                '2026-08-22T09:00:00'
            ),
            (
                3002, 103, 2, 1, 'CLEARED',
                'Library clearance completed.',
                '2026-08-22T10:00:00'
            ),
            (
                3003, 103, 3, 2, 'CLEARED',
                'Dormitory clearance completed.',
                '2026-08-23T09:00:00'
            ),
            (
                3004, 103, 4, 3, 'CLEARED',
                'Sport clearance completed.',
                '2026-08-23T10:00:00'
            ),
            (
                3005, 103, 5, 1, 'CLEARED',
                'Café clearance completed.',
                '2026-08-24T09:00:00'
            ),
            (
                3006, 103, 6, 2, 'CLEARED',
                'Faculty store clearance completed.',
                '2026-08-24T10:00:00'
            ),
        ]

        clearance_offices = {}

        for (
            record_id,
            clearance_id,
            office_id,
            officer_id,
            status,
            notes,
            reviewed_at,
        ) in clearance_offices_data:

            clearance_offices[record_id] = ClearanceOffice.objects.create(
                id=record_id,
                clearance=clearances[clearance_id],
                office=offices[office_id],
                assigned_officer=staff_members[officer_id],
                status=status,
                notes=notes or '',
                reviewed_at=parse_datetime(reviewed_at),
            )

        self.stdout.write('Creating issues...')

        issues_data = [
            (
                1,
                1003,
                'Unreturned room key',
                'The student has not returned the room key assigned to them.',
                'OPEN',
                102,
                '2026-09-16T11:00:00',
                None,
                None,
                '',
            ),
            (
                2,
                2005,
                'Outstanding café balance',
                'The student has an outstanding balance at the university café.',
                'RESOLVED',
                101,
                '2026-09-12T09:30:00',
                101,
                '2026-09-13T14:00:00',
                'Outstanding balance was paid by the student.',
            ),
        ]

        issues = {}

        for (
            issue_id,
            clearance_office_id,
            reason,
            description,
            status,
            created_by,
            created_at,
            resolved_by,
            resolved_at,
            resolution_note,
        ) in issues_data:

            issues[issue_id] = Issue.objects.create(
                id=issue_id,
                clearance_office=clearance_offices[
                    clearance_office_id
                ],
                reason=reason,
                description=description,
                status=status,
                created_by=users[created_by],
                created_at=parse_datetime(created_at),
                resolved_by=(
                    users[resolved_by]
                    if resolved_by
                    else None
                ),
                resolved_at=parse_datetime(resolved_at),
                resolution_note=resolution_note,
            )

        self.stdout.write('Creating notifications...')

        notifications_data = [
            (
                1, 1,
                'Clearance Initiated',
                'Your clearance has been initiated by the Registrar.',
                'CLEARANCE',
                False,
                101,
                None,
                '2026-09-15T09:35:00',
            ),
            (
                2, 1,
                'Clearance Issue',
                'The Dormitory office has reported an issue with your clearance.',
                'ISSUE',
                False,
                101,
                1,
                '2026-09-16T11:05:00',
            ),
            (
                3, 2,
                'Clearance Ready for Final Approval',
                'All required offices have cleared your graduation clearance. It is now waiting for Registrar approval.',
                'CLEARANCE',
                True,
                102,
                None,
                '2026-09-13T15:00:00',
            ),
            (
                4, 3,
                'Clearance Completed',
                'Your graduation clearance has been completed successfully.',
                'CLEARANCE',
                True,
                103,
                None,
                '2026-08-25T14:05:00',
            ),
        ]

        for (
            notification_id,
            user_id,
            title,
            message,
            notification_type,
            is_read,
            clearance_id,
            issue_id,
            created_at,
        ) in notifications_data:

            Notification.objects.create(
                id=notification_id,
                user=users[user_id],
                title=title,
                message=message,
                type=notification_type,
                is_read=is_read,
                clearance=(
                    clearances[clearance_id]
                    if clearance_id
                    else None
                ),
                issue=(
                    issues[issue_id]
                    if issue_id
                    else None
                ),
                created_at=parse_datetime(created_at),
            )

        self.stdout.write('Creating audit logs...')

        audit_logs_data = [
            (
                1,
                201,
                'CLEARANCE_INITIATED',
                'Registrar initiated clearance for BDU00123.',
                'Clearance',
                101,
                '2026-09-15T09:30:00',
            ),
            (
                2,
                102,
                'ISSUE_CREATED',
                'Dormitory officer created an issue for BDU00123.',
                'Issue',
                1,
                '2026-09-16T11:00:00',
            ),
            (
                3,
                101,
                'ISSUE_RESOLVED',
                'Café issue for BDU00124 was resolved.',
                'Issue',
                2,
                '2026-09-13T14:00:00',
            ),
            (
                4,
                201,
                'CLEARANCE_APPROVED',
                'Registrar approved clearance for BDU00125.',
                'Clearance',
                103,
                '2026-08-25T14:00:00',
            ),
        ]

        for (
            log_id,
            user_id,
            action,
            description,
            entity_type,
            entity_id,
            created_at,
        ) in audit_logs_data:

            AuditLog.objects.create(
                id=log_id,
                user=users[user_id],
                action=action,
                description=description,
                entity_type=entity_type,
                entity_id=entity_id,
                created_at=parse_datetime(created_at),
            )

        self.stdout.write(
            self.style.SUCCESS(
                'Mock data seeded successfully.'
            )
        )
        self.stdout.write(
            f'All users use password: {SEED_PASSWORD}'
        )