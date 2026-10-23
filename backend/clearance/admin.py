from django.contrib import admin
from .models import Clearance, ClearanceOffice, ClearanceType, Issue, Office, OfficeAssignment


@admin.register(Office)
class OfficeAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name', 'code')


@admin.register(OfficeAssignment)
class OfficeAssignmentAdmin(admin.ModelAdmin):
    list_display = ('staff', 'office', 'faculty', 'department', 'section', 'is_active')
    list_filter = ('office', 'is_active', 'faculty', 'department')
    search_fields = ('staff__full_name', 'office__name')


@admin.register(ClearanceType)
class ClearanceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)


class ClearanceOfficeInline(admin.TabularInline):
    model = ClearanceOffice
    extra = 0
    fields = ('office', 'assigned_officer', 'status', 'reviewed_at')
    readonly_fields = ('reviewed_at',)


@admin.register(Clearance)
class ClearanceAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'student', 'clearance_type', 'status', 'certificate_code',
        'initiated_by', 'initiated_at', 'final_approved_by', 'completed_at'
    )
    list_filter = ('status', 'clearance_type', 'initiated_at')
    search_fields = (
        'student__student_id', 'student__full_name', 'certificate_code',
        'initiated_by__username'
    )
    inlines = [ClearanceOfficeInline]


@admin.register(ClearanceOffice)
class ClearanceOfficeAdmin(admin.ModelAdmin):
    list_display = ('id', 'clearance', 'office', 'assigned_officer', 'status', 'reviewed_at')
    list_filter = ('status', 'office')
    search_fields = ('clearance__student__student_id', 'clearance__student__full_name', 'assigned_officer__full_name')


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'clearance_office', 'reason', 'status', 'created_by', 'resolved_by', 'created_at')
    list_filter = ('status', 'clearance_office__office', 'created_at')
    search_fields = ('reason', 'description', 'clearance_office__clearance__student__full_name')
