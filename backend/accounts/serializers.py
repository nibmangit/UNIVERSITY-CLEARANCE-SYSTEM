from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Staff, Student, User


class LoginSerializer(serializers.Serializer):
    university_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        university_id = attrs.get('university_id')
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            university_id=university_id,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError('Invalid university ID or password.')

        refresh = RefreshToken.for_user(user)

        return {'refresh': str(refresh), 'access': str(refresh.access_token), }
        
class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'university_id', 'username', 'email', 'first_name', 'last_name' , 'role']
        
class StudentProfileSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source='faculty.name')
    department = serializers.CharField(source='department.name')
    section = serializers.CharField(source='section.name')

    class Meta:
        model = Student
        fields = ['student_id', 'full_name', 'faculty', 'department', 'section', 'year',  'email', 'phone', ]
        read_only_fields = fields


class RegistrarStudentSerializer(serializers.ModelSerializer):
    faculty = serializers.CharField(source='faculty.name')
    department = serializers.CharField(source='department.name')
    section = serializers.CharField(source='section.name')
    active_clearance = serializers.SerializerMethodField()

    ACTIVE_STATUSES = ('INITIATED', 'IN_PROGRESS', 'PENDING_REGISTRAR')

    class Meta:
        model = Student
        fields = [
            'student_id', 'full_name', 'faculty', 'department', 'section',
            'year', 'email', 'phone', 'active_clearance',
        ]
        read_only_fields = fields

    def get_active_clearance(self, obj):
        # Uses the prefetched `clearances`, so no extra query per student.
        active = [c for c in obj.clearances.all() if c.status in self.ACTIVE_STATUSES]
        if not active:
            return None

        latest = max(active, key=lambda c: (c.initiated_at, c.id))
        return {
            'id': latest.id,
            'status': latest.status,
            'clearance_type': {'id': latest.clearance_type_id, 'name': latest.clearance_type.name},
        }

class StaffProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = ['employee_id', 'full_name', 'email', 'phone', 'is_active', ]
        read_only_fields = fields