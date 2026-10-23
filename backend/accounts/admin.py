from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Faculty, Department, Section, Staff, Student, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'university_id', 'role', 'email', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('username', 'university_id', 'email', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Clearance Information', {'fields': ('role', 'university_id')}),
    )


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'faculty', 'is_active')
    list_filter = ('faculty', 'is_active')
    search_fields = ('name', 'code', 'faculty__name')


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'year', 'is_active')
    list_filter = ('department__faculty', 'department', 'year', 'is_active')
    search_fields = ('name', 'department__name')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('student_id', 'full_name', 'faculty', 'department', 'section', 'year', 'email')
    list_filter = ('faculty', 'department', 'year')
    search_fields = ('student_id', 'full_name', 'email', 'phone')


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'full_name', 'email', 'phone', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('employee_id', 'full_name', 'email', 'phone')
