"""
python manage.py seed_data

Creates the base data the system cannot create for itself: faculties, departments, sections,
the six offices, clearance types, the staff and student accounts, and the office assignments
that decide which officer handles which student.

It does NOT create clearances, issues, notifications or logs. The app creates those.
Safe to run more than once: anything that already exists is left alone (passwords included).
"""
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from accounts.models import Department, Faculty, Section, Staff, Student
from clearance.models import ClearanceType, Office, OfficeAssignment

User = get_user_model()

DEFAULT_PASSWORD = 'Clearance@2026'

# ---------- Structure ----------

FACULTIES = [
    {
        'code': 'COMP',
        'name': 'Faculty of Computing',
        'departments': [('SE', 'Software Engineering'), ('CS', 'Computer Science')],
    },
    {
        'code': 'BUS',
        'name': 'Faculty of Business and Economics',
        'departments': [('ACC', 'Accounting and Finance'), ('MGT', 'Management')],
    },
]

# (section name, year), created for every department.
SECTIONS = [('A', 3), ('B', 3), ('A', 4)]

# The six offices every clearance needs. The codes are used by the clearance logic: do not rename them.
OFFICES = [
    ('ADVISOR', 'Advisor', 'Confirms the student has completed the department requirements.'),
    ('LIBRARY', 'Library', 'Confirms no books are overdue or unreturned.'),
    ('DORMITORY', 'Dormitory', 'Confirms the room has been handed back in good condition.'),
    ('SPORT', 'Sport Office', 'Confirms all sports equipment has been returned.'),
    ('CAFE', 'Café', 'Confirms there is no outstanding balance or unreturned item.'),
    ('FACULTY_STORE', 'Faculty Store', 'Confirms all faculty property has been returned.'),
]

CLEARANCE_TYPES = [
    ('Graduation', 'Clearance for students who are graduating.'),
    ('Withdrawal', 'Clearance for students leaving the university before graduating.'),
    ('Transfer', 'Clearance for students transferring to another institution.'),
]

# ---------- People ----------

ADMIN = ('ADM001', 'Yohannes Admasu')
REGISTRAR = ('REG001', 'Mulugeta Tesema')

# One officer per office. Nobody covers two different offices.
OFFICERS = [
    ('ADV001', 'Dr. Hana Alemu', 'ADVISOR'),
    ('LIB001', 'Tsegaye Wolde', 'LIBRARY'),
    ('DOR001', 'Birtukan Shiferaw', 'DORMITORY'),
    ('SPO001', 'Getnet Abera', 'SPORT'),
    ('CAF001', 'Almaz Teshome', 'CAFE'),
    ('STO001', 'Zerihun Mekonnen', 'FACULTY_STORE'),
]

STUDENT_NAMES = [
    'Abebe Kebede', 'Mahlet Tesfaye', 'Samuel Bekele', 'Marta Girma', 'Dawit Tadesse', 'Selam Haile',
    'Yonas Mengistu', 'Tigist Worku', 'Kidus Assefa', 'Ruth Demissie', 'Nathnael Getachew', 'Bethlehem Lemma',
    'Henok Alemayehu', 'Meron Solomon', 'Biniyam Tefera', 'Saron Abate', 'Eyob Kassa', 'Liya Fikadu',
    'Robel Negash', 'Eden Zewdu', 'Mikias Tilahu', 'Rediet Yilma', 'Fitsum Berhane', 'Helen Desta',
]

STUDENTS_PER_DEPARTMENT = 6
# Which of SECTIONS each student in a department gets: two in 3A, two in 3B, two in 4A.
SECTION_PATTERN = [0, 0, 1, 1, 2, 2]


def split_name(full_name):
    parts = [part for part in full_name.split() if part not in ('Dr.', 'Prof.')]
    return parts[0], ' '.join(parts[1:])


def make_phone(number):
    return f'+2519{10000000 + number * 7919:08d}'


class Command(BaseCommand):
    help = 'Creates the faculties, offices, officers, registrar, admin, students and assignments the system needs.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--password',
            default=DEFAULT_PASSWORD,
            help=f'Password for every NEW account (default: {DEFAULT_PASSWORD}).',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Run even when DEBUG is off. Only for servers you know are safe for demo accounts.',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG and not options['force']:
            raise CommandError(
                'DEBUG is off, so this looks like a real server. Demo accounts share one password, '
                'so seeding is blocked. Use --force if you really mean it.'
            )

        self.password = options['password']
        self.counts = {}
        self.existing_users = []
        self.student_rows = []

        departments, sections = self._seed_structure()
        offices = self._seed_offices()
        self._seed_clearance_types()
        self._seed_staff(offices, departments, sections)
        self._seed_students(departments, sections)
        self._report()

    # ---------- helpers ----------

    def _count(self, label):
        self.counts[label] = self.counts.get(label, 0) + 1

    def _get_or_create(self, label, model, lookup, defaults=None):
        obj, created = model.objects.get_or_create(**lookup, defaults=defaults or {})
        if created:
            self._count(label)
        return obj

    def _user(self, *, university_id, full_name, role, **extra):
        """Creates the login account. An account that already exists is left exactly as it is."""
        user = User.objects.filter(university_id=university_id).first()
        if user is not None:
            self.existing_users.append(university_id)
            return user

        first_name, last_name = split_name(full_name)
        user = User.objects.create_user(
            username=university_id.lower(),
            password=self.password,
            email=f'{university_id.lower()}@example.edu',
            first_name=first_name,
            last_name=last_name,
            role=role,
            university_id=university_id,
            **extra,
        )
        self._count('user accounts')
        return user

    def _staff(self, *, university_id, full_name, role, number, **extra):
        user = self._user(university_id=university_id, full_name=full_name, role=role, **extra)
        staff, created = Staff.objects.get_or_create(
            user=user,
            defaults={
                'employee_id': university_id,
                'full_name': full_name,
                'email': user.email or f'{university_id.lower()}@example.edu',
                'phone': make_phone(number),
            },
        )
        if created:
            self._count('staff profiles')
        return staff

    def _assign(self, staff, office, faculty=None, department=None, section=None):
        _, created = OfficeAssignment.objects.get_or_create(
            staff=staff,
            office=office,
            faculty=faculty,
            department=department,
            section=section,
            defaults={'is_active': True},
        )
        if created:
            self._count('office assignments')

    # ---------- seeding ----------

    def _seed_structure(self):
        departments = []
        sections = {}  # department id -> its sections, in the order of SECTIONS

        for item in FACULTIES:
            faculty = self._get_or_create('faculties', Faculty, {'code': item['code']}, {'name': item['name']})

            for code, name in item['departments']:
                department = self._get_or_create(
                    'departments', Department, {'faculty': faculty, 'code': code}, {'name': name},
                )
                departments.append(department)

                for section_name, year in SECTIONS:
                    section = self._get_or_create(
                        'sections', Section, {'department': department, 'name': section_name, 'year': year},
                    )
                    sections.setdefault(department.pk, []).append(section)

        return departments, sections

    def _seed_offices(self):
        offices = {}
        for code, name, description in OFFICES:
            offices[code] = self._get_or_create(
                'offices', Office, {'code': code}, {'name': name, 'description': description},
            )
        return offices

    def _seed_clearance_types(self):
        for name, description in CLEARANCE_TYPES:
            self._get_or_create('clearance types', ClearanceType, {'name': name}, {'description': description})

    def _seed_staff(self, offices, departments, sections):
        self._staff(
            university_id=ADMIN[0], full_name=ADMIN[1], role=User.Role.ADMIN, number=1,
            is_staff=True, is_superuser=True,
        )
        self._staff(university_id=REGISTRAR[0], full_name=REGISTRAR[1], role=User.Role.REGISTRAR, number=2)

        officers = {}
        for number, (university_id, full_name, office_code) in enumerate(OFFICERS, start=10):
            officers[office_code] = self._staff(
                university_id=university_id, full_name=full_name, role=User.Role.OFFICER, number=number,
            )

        # The advisor is picked by faculty + department + section: one assignment per section.
        for department in departments:
            for section in sections[department.pk]:
                self._assign(
                    officers['ADVISOR'], offices['ADVISOR'],
                    faculty=department.faculty, department=department, section=section,
                )

        # The faculty store is picked by faculty alone: one assignment per faculty.
        for faculty in {department.faculty for department in departments}:
            self._assign(officers['FACULTY_STORE'], offices['FACULTY_STORE'], faculty=faculty)

        # Every other office has one officer for the whole university.
        for code in ('LIBRARY', 'DORMITORY', 'SPORT', 'CAFE'):
            self._assign(officers[code], offices[code])

    def _seed_students(self, departments, sections):
        for index, full_name in enumerate(STUDENT_NAMES):
            department = departments[(index // STUDENTS_PER_DEPARTMENT) % len(departments)]
            section = sections[department.pk][SECTION_PATTERN[index % len(SECTION_PATTERN)]]
            student_id = f'BDU{index + 1:05d}'

            user = self._user(university_id=student_id, full_name=full_name, role=User.Role.STUDENT)
            _, created = Student.objects.get_or_create(
                user=user,
                defaults={
                    'student_id': student_id,
                    'full_name': full_name,
                    'faculty': department.faculty,
                    'department': department,
                    'section': section,
                    'year': section.year,
                    'email': user.email or f'{student_id.lower()}@example.edu',
                    'phone': make_phone(100 + index),
                },
            )
            if created:
                self._count('student profiles')

            self.student_rows.append((student_id, full_name, department.name, section.name, section.year))

    # ---------- output ----------

    def _report(self):
        out = self.stdout
        out.write(self.style.SUCCESS('Seed data is ready.'))

        if self.counts:
            for label, number in self.counts.items():
                out.write(f'  created {number} {label}')
        else:
            out.write('  nothing new was created: everything already existed.')

        if self.existing_users:
            out.write(self.style.WARNING(
                f'  {len(self.existing_users)} account(s) already existed and were left unchanged '
                f'(their passwords were NOT reset): {", ".join(self.existing_users)}'
            ))

        out.write('')
        out.write(f'Password for every new account: {self.password}')
        out.write('Log in with the University ID:')
        out.write('')
        out.write(f'  {ADMIN[0]:<8} Admin       {ADMIN[1]} (also a superuser for /admin/)')
        out.write(f'  {REGISTRAR[0]:<8} Registrar   {REGISTRAR[1]}')

        office_names = {code: name for code, name, _ in OFFICES}
        for university_id, full_name, office_code in OFFICERS:
            out.write(f'  {university_id:<8} Officer     {full_name} ({office_names[office_code]})')

        out.write('')
        for student_id, full_name, department, section, year in self.student_rows:
            out.write(f'  {student_id}  {full_name:<19} {department}, Section {section}, Year {year}')