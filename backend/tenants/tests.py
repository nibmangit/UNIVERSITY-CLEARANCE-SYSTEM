from datetime import timedelta

from django.core.exceptions import ValidationError
from django.db.models import ProtectedError
from django.test import TestCase
from django.utils import timezone

from accounts.models import User

from .models import Tenant


class TenantModelTests(TestCase):
    def make_tenant(self, **overrides):
        values = {'name': 'Selam Trading PLC', 'slug': 'selam', 'organization_type': Tenant.Type.COMPANY}
        values.update(overrides)
        return Tenant.objects.create(**values)

    def test_good_codes_are_accepted(self):
        for slug in ['selam', 'bdu-university', 'a1', 'ab']:
            Tenant(name='Test', slug=slug).full_clean()

    def test_bad_codes_are_rejected(self):
        for slug in ['Selam', 'sel am', '1selam', 's', 'sel_am', 'selam-', 'a' * 41]:
            with self.assertRaises(ValidationError, msg=slug):
                Tenant(name='Test', slug=slug).full_clean()

    def test_reserved_codes_are_rejected(self):
        for slug in ['admin', 'api', 'login', 'verify']:
            with self.assertRaises(ValidationError, msg=slug):
                Tenant(name='Test', slug=slug).full_clean()

    def test_codes_are_unique(self):
        self.make_tenant()

        with self.assertRaises(ValidationError):
            Tenant(name='Another', slug='selam').full_clean()

    def test_save_lowercases_the_code(self):
        tenant = self.make_tenant(slug=' Selam ')

        self.assertEqual(tenant.slug, 'selam')

    def test_trial_is_open_until_it_ends(self):
        today = timezone.localdate()

        self.assertTrue(self.make_tenant(slug='no-end').is_open)
        self.assertTrue(self.make_tenant(slug='future', trial_ends_on=today + timedelta(days=1)).is_open)
        self.assertTrue(self.make_tenant(slug='today', trial_ends_on=today).is_open)
        self.assertFalse(self.make_tenant(slug='past', trial_ends_on=today - timedelta(days=1)).is_open)

    def test_active_is_open_and_suspended_is_closed(self):
        self.assertTrue(self.make_tenant(slug='active', status=Tenant.Status.ACTIVE).is_open)
        self.assertFalse(self.make_tenant(slug='stopped', status=Tenant.Status.SUSPENDED).is_open)

    def test_a_tenant_with_users_cannot_be_deleted(self):
        tenant = self.make_tenant()
        User.objects.create_user(
            username='emp-1',
            password='a-strong-password-1',
            university_id='EMP-1',
            role=User.Role.STUDENT,
            tenant=tenant,
        )

        with self.assertRaises(ProtectedError):
            tenant.delete()