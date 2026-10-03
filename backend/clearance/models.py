from django.db import models

from accounts.models import Staff, Faculty, Department, Section


class Office(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class OfficeAssignment(models.Model):
    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name='office_assignments',
    )

    office = models.ForeignKey(
        Office,
        on_delete=models.CASCADE,
        related_name='assignments',
    )

    faculty = models.ForeignKey(
        Faculty, on_delete=models.SET_NULL,
        null=True,blank=True,
        related_name='office_assignments',
    )

    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='office_assignments',
    )

    section = models.ForeignKey(
        Section, on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='office_assignments',
    )
    
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.staff.full_name} - {self.office.name}'
    
class ClearanceType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Clearance(models.Model):
    class Status(models.TextChoices):
        INITIATED = 'INITIATED', 'Initiated'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        PENDING_REGISTRAR = 'PENDING_REGISTRAR', 'Pending Registrar'
        COMPLETED = 'COMPLETED', 'Completed'
        CANCELLED = 'CANCELLED', 'Cancelled'

    student = models.ForeignKey(
        'accounts.Student',
        on_delete=models.PROTECT,
        related_name='clearances',
    )

    clearance_type = models.ForeignKey(
        ClearanceType, on_delete=models.PROTECT,
        related_name='clearances',
    )

    status = models.CharField(
        max_length=30, choices=Status.choices,
        default=Status.INITIATED,
    )
    
    reason = models.CharField(max_length=200, blank=True, default='')

    initiated_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT,
        related_name='initiated_clearances',
    )

    initiated_at = models.DateTimeField(auto_now_add=True)
    final_approved_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='approved_clearances',
    )

    final_approved_at = models.DateTimeField(null=True, blank=True, )
    completed_at = models.DateTimeField(null=True, blank=True,)
    submitted_at = models.DateTimeField(null=True, blank=True)
        

    def __str__(self):
        return f'{self.student.student_id} - {self.clearance_type.name}'
    

class ClearanceOffice(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CLEARED = 'CLEARED', 'Cleared'
        FLAGGED = 'FLAGGED', 'Flagged'

    clearance = models.ForeignKey(
        Clearance, on_delete=models.CASCADE,
        related_name='clearance_offices',
    )
    office = models.ForeignKey(
        Office, on_delete=models.PROTECT,
        related_name='clearance_records',
    )
    assigned_officer = models.ForeignKey(
        'accounts.Staff', on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='assigned_clearances',
    )
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.PENDING,
    )
    notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True, )

    def __str__(self):
        return f'{self.clearance} - {self.office.name}'
    
class Issue(models.Model):
    class Status(models.TextChoices):
        OPEN = 'OPEN', 'Open'
        RESOLVED = 'RESOLVED', 'Resolved'
        CANCELLED = 'CANCELLED', 'Cancelled'

    clearance_office = models.ForeignKey(
        ClearanceOffice, on_delete=models.CASCADE,
        related_name='issues',
    )

    reason = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(
        max_length=20, choices=Status.choices,
        default=Status.OPEN,
    )

    created_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT,
        related_name='created_issues',
    )
    resolved_by = models.ForeignKey(
        'accounts.User', on_delete=models.PROTECT,
        null=True, blank=True,
        related_name='resolved_issues',
    )

    resolution_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True, )

    def __str__(self):
        return f'{self.reason} - {self.clearance_office}'