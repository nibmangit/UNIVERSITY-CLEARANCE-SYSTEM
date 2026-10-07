import re
import secrets
from datetime import timezone as utc_timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.conf import settings
from django.db import IntegrityError
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from accounts.models import User
from notifications.services import AuditLogService

from .certificate import build_certificate_pdf
from .models import Clearance

# No 0, O, 1, I or L, so a code that is read aloud or typed by hand is not mistaken.
CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'


def _new_code():
    raw = ''.join(secrets.choice(CODE_ALPHABET) for _ in range(12))
    return f'{raw[0:4]}-{raw[4:8]}-{raw[8:12]}'


def ensure_certificate_code(clearance):
    """Gives a completed clearance its verification code the first time one is needed."""
    if clearance.certificate_code:
        return clearance.certificate_code

    for _ in range(5):
        try:
            # Only one writer can fill the empty field, so two requests at once end up with the same code.
            Clearance.objects.filter(pk=clearance.pk, certificate_code__isnull=True).update(
                certificate_code=_new_code()
            )
        except IntegrityError:
            continue  # the random code collided with another clearance's code: try again

        clearance.refresh_from_db(fields=['certificate_code'])
        if clearance.certificate_code:
            return clearance.certificate_code

    raise RuntimeError('Could not create a certificate code.')


def _zone():
    try:
        return ZoneInfo(settings.CERTIFICATE_TIME_ZONE)
    except ZoneInfoNotFoundError:
        return utc_timezone.utc


def _date_text(value, zone):
    if not value:
        return '—'

    local = value.astimezone(zone)
    return f'{local.day} {local:%B %Y}'


def _person_name(user):
    if user is None:
        return '—'

    for profile in ('staff_profile', 'student_profile'):
        if hasattr(user, profile):
            return getattr(user, profile).full_name

    return user.get_full_name() or user.username


class ClearanceDocumentView(APIView):
    """
    GET /clearances/<id>/document/  returns the clearance certificate as a PDF.
    A student can open their own, the registrar and admin any. Only completed clearances have one.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = request.user

        if user.role not in (User.Role.STUDENT, User.Role.REGISTRAR, User.Role.ADMIN):
            raise PermissionDenied('Only students and the registrar can open this document.')

        clearances = Clearance.objects.select_related(
            'student', 'student__faculty', 'student__department', 'student__section',
            'clearance_type', 'final_approved_by', 'final_approved_by__staff_profile',
        )
        if user.role == User.Role.STUDENT:
            clearances = clearances.filter(student__user=user)

        clearance = clearances.filter(pk=pk).first()
        if clearance is None:
            raise NotFound('Clearance not found.')

        if clearance.status != Clearance.Status.COMPLETED:
            raise ValidationError('This clearance has not been completed yet.')

        zone = _zone()
        code = ensure_certificate_code(clearance)
        student = clearance.student

        offices = [
            {
                'name': item.office.name,
                'status': item.get_status_display(),
                'officer': item.assigned_officer.full_name if item.assigned_officer else '—',
                'date': _date_text(item.reviewed_at, zone),
            }
            for item in clearance.clearance_offices.select_related('office', 'assigned_officer').order_by('id')
        ]

        pdf = build_certificate_pdf({
            'university_name': settings.UNIVERSITY_NAME,
            'certificate_number': f'CC-{clearance.pk:06d}',
            'verification_code': code,
            'verify_url': f'{settings.FRONTEND_URL}/verify/{code}',
            'student': {
                'name': student.full_name,
                'student_id': student.student_id,
                'faculty': student.faculty.name,
                'department': student.department.name,
                'section': student.section.name,
                'year': student.year,
            },
            'clearance_type': clearance.clearance_type.name,
            'started': _date_text(clearance.initiated_at, zone),
            'completed': _date_text(clearance.completed_at, zone),
            'approved_by': _person_name(clearance.final_approved_by),
            'approved_on': _date_text(clearance.final_approved_at, zone),
            'generated': _date_text(timezone.now(), zone),
            'offices': offices,
        })

        AuditLogService.log(
            user=user,
            action='DOCUMENT_DOWNLOADED',
            description=f'{_person_name(user)} opened the certificate for clearance {clearance.pk}.',
            entity_type='Clearance',
            entity_id=clearance.pk,
        )

        filename = re.sub(r'[^A-Za-z0-9_.-]', '_', f'clearance-{clearance.pk}-{student.student_id}.pdf')
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{filename}"'
        response['Cache-Control'] = 'private, no-store'
        return response
    
def normalize_code(value):
    """Accepts 'k7m2-9qxp-4twd', 'K7M29QXP4TWD' and so on. Returns 'K7M2-9QXP-4TWD', or None if it cannot be a code."""
    cleaned = re.sub(r'[^A-Za-z0-9]', '', value or '').upper()

    if len(cleaned) != 12:
        return None

    return f'{cleaned[0:4]}-{cleaned[4:8]}-{cleaned[8:12]}'


class CertificateVerifyView(APIView):
    """
    GET /clearances/verify/<code>/  (public, no login).
    Confirms that a certificate is real and returns the bare minimum about it.
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # a stale token in the request must not cause a 401
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'verify'

    def get(self, request, code):
        normalized = normalize_code(code)
        clearance = None

        if normalized:
            clearance = (
                Clearance.objects
                .select_related('student', 'clearance_type')
                .filter(certificate_code=normalized, status=Clearance.Status.COMPLETED)
                .first()
            )

        # The same answer for a wrong code, a badly formed one, and a clearance that is not completed.
        if clearance is None:
            raise NotFound('No certificate matches this code.')

        return Response({
            'valid': True,
            'university_name': settings.UNIVERSITY_NAME,
            'certificate_number': f'CC-{clearance.pk:06d}',
            'student_name': clearance.student.full_name,
            'clearance_type': clearance.clearance_type.name,
            'completed_on': _date_text(clearance.completed_at, _zone()),
        })