from rest_framework import serializers

from .models import Clearance, ClearanceOffice


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