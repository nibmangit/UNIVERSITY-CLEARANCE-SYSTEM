from rest_framework import serializers

from accounts.models import Student
from .services import ClearanceService
from .models import Clearance, ClearanceOffice, ClearanceType


class ClearanceOfficeSerializer(serializers.ModelSerializer):
    office = serializers.CharField(source='office.name')
    assigned_officer = serializers.CharField(
        source='assigned_officer.full_name',
        allow_null=True,
    )

    class Meta:
        model = ClearanceOffice
        fields = [
            'id', 'office', 'assigned_officer',
            'status', 'notes', 'reviewed_at',
        ]
        read_only_fields = fields


class ClearanceSerializer(serializers.ModelSerializer):
    student_id = serializers.CharField(source='student.student_id')
    student_name = serializers.CharField(source='student.full_name')
    clearance_type = serializers.CharField(source='clearance_type.name')
    clearance_offices = ClearanceOfficeSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Clearance
        fields = [
            'id', 'student_id', 'student_name', 'clearance_type', 'status','initiated_by',
            'initiated_at', 'final_approved_by', 'final_approved_at', 'completed_at', 'submitted_at', 'clearance_offices', 
            ]
        read_only_fields = fields
        
    
class ClearanceCreateSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    clearance_type_id = serializers.IntegerField()

    def validate(self, attrs):
        try:
            student = Student.objects.get(student_id=attrs['student_id'] )
        except Student.DoesNotExist:
            raise serializers.ValidationError({'student_id': 'Student not found.' })

        try:
            clearance_type = ClearanceType.objects.get(id=attrs['clearance_type_id'], is_active=True, )
        except ClearanceType.DoesNotExist:
            raise serializers.ValidationError({ 'clearance_type_id': ('Clearance type not found or inactive.' ) })

        attrs['student'] = student
        attrs['clearance_type'] = clearance_type

        return attrs

    def create(self, validated_data):
        return ClearanceService.create_clearance(
            student=validated_data['student'],
            clearance_type=validated_data['clearance_type'],
            initiated_by=self.context['request'].user,
        )
