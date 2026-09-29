from rest_framework import serializers

from accounts.models import Student, User, Staff 
from .models import ClearanceType, Issue, Office


class SimpleUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'full_name', 'university_id']

    def get_full_name(self, obj):
        if hasattr(obj, 'staff_profile'):
            return obj.staff_profile.full_name

        if hasattr(obj, 'student_profile'):
            return obj.student_profile.full_name

        return obj.get_full_name() or obj.username

class IssueSerializer(serializers.ModelSerializer):
    created_by = serializers.CharField(source='created_by.username', allow_null=True, )
    resolved_by = serializers.CharField(source='resolved_by.username', allow_null=True, )

    class Meta:
        model = Issue
        fields = [ 'id', 'reason', 'description', 'status', 'created_by', 'resolved_by', 'resolution_note', 'created_at', 'resolved_at', ]
        read_only_fields = fields
        
class ClearanceStudentSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source='faculty.name')
    department = serializers.CharField(source='department.name')
    section = serializers.CharField(source='section.name')

    class Meta:
        model = Student
        fields = ['student_id', 'full_name', 'faculty', 'department', 'section', 'year', ]
        read_only_fields = fields

class ClearanceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClearanceType
        fields = ['id', 'name', ]
        read_only_fields = fields

class OfficeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Office
        fields = ['id', 'name', 'code', ]
        read_only_fields = fields

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['id', 'employee_id', 'full_name', ]
        read_only_fields = fields


class IssueSerializer(serializers.ModelSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    resolved_by = SimpleUserSerializer(read_only=True, allow_null=True, )

    class Meta:
        model = Issue
        fields = [
            'id', 'reason', 'description', 'status', 'created_by', 
            'resolved_by', 'resolution_note', 'created_at', 'resolved_at', 
            ]
        read_only_fields = fields
