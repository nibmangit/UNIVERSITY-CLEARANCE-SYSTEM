from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        OFFICER = 'OFFICER', 'Officer'
        REGISTRAR = 'REGISTRAR', 'Registrar'
        ADMIN = 'ADMIN', 'Admin'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT, )
    university_id = models.CharField(max_length=50, unique=True, null=True, blank=True, )

    def __str__(self):
        return self.username


class Faculty(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20, unique=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Department(models.Model):
    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.PROTECT,
        related_name='departments',
    )
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['faculty', 'code'],
                name='unique_department_code_per_faculty',
            ),
        ]

    def __str__(self):
        return self.name


class Section(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='sections',
    )
    name = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['department', 'name', 'year'],
                name='unique_section_per_department_year',
            ),
        ]

    def __str__(self):
        return self.name


class Student(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='student_profile',
    )
    student_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=200)

    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.PROTECT,
        related_name='students',
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name='students',
    )
    section = models.ForeignKey(
        Section,
        on_delete=models.PROTECT,
        related_name='students',
    )

    year = models.PositiveIntegerField()
    email = models.EmailField()
    phone = models.CharField(max_length=30)

    def __str__(self):
        return self.full_name


class Staff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile', )
    employee_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.full_name