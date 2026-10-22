from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone

# Organization codes that would clash with addresses or system names.
RESERVED_SLUGS = {
    'admin', 'api', 'app', 'www', 'login', 'logout', 'verify', 'platform',
    'static', 'health', 'support', 'help', 'root', 'system',
}

slug_format = RegexValidator(
    regex=r'^[a-z][a-z0-9-]{0,38}[a-z0-9]$',
    message='Use 2 to 40 characters: lowercase letters, digits and hyphens, starting with a letter.',
)


def validate_slug_not_reserved(value):
    if value in RESERVED_SLUGS:
        raise ValidationError('This organization code is reserved.')


class Tenant(models.Model):
    """One customer organization. Everything else in the system will belong to a tenant."""

    class Type(models.TextChoices):
        COMPANY = 'COMPANY', 'Company'
        NGO = 'NGO', 'NGO'
        BANK = 'BANK', 'Bank or financial institution'
        UNIVERSITY = 'UNIVERSITY', 'University or college'
        GOVERNMENT = 'GOVERNMENT', 'Government office'
        OTHER = 'OTHER', 'Other'

    class Status(models.TextChoices):
        TRIAL = 'TRIAL', 'Trial'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    name = models.CharField(max_length=150)

    # The organization code that people type at login, for example "selam".
    slug = models.SlugField(
        max_length=40,
        unique=True,
        validators=[slug_format, validate_slug_not_reserved],
        help_text='The organization code people type at login. Lowercase letters, digits and hyphens.',
    )

    organization_type = models.CharField(max_length=20, choices=Type.choices, default=Type.COMPANY)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.TRIAL)
    trial_ends_on = models.DateField(null=True, blank=True)
    plan = models.CharField(max_length=30, default='trial')

    # The organization's own words, for example {"member": "Employee", "manager": "HR Manager"}.
    terms = models.JSONField(default=dict, blank=True)

    # Language, time zone, calendar, certificate wording and similar choices.
    preferences = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = (self.slug or '').strip().lower()
        super().save(*args, **kwargs)

    @property
    def is_open(self):
        """True when people of this organization may log in and use the system."""
        if self.status == self.Status.SUSPENDED:
            return False

        if self.status == self.Status.TRIAL and self.trial_ends_on and self.trial_ends_on < timezone.localdate():
            return False

        return True
    
