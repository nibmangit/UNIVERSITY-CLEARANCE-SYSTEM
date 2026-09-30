from rest_framework import serializers

from accounts.models import Student
from .services import ClearanceService
from .models import Clearance, ClearanceOffice, ClearanceType, Issue
from .helper_serializer import (
    ClearanceStudentSerializer, ClearanceTypeSerializer,
    OfficeSerializer, StaffSerializer, IssueSerializer, SimpleUserSerializer
    )


class ClearanceOfficeSerializer(serializers.ModelSerializer):
    office = OfficeSerializer(read_only=True, )
    assigned_officer = StaffSerializer(read_only=True, allow_null=True, )
    issues = IssueSerializer(many=True, read_only=True, )
    
    class Meta:
        model = ClearanceOffice
        fields = [
            'id', 'office', 'assigned_officer', 'status', 
            'notes', 'reviewed_at', 'issues',
            ]
        read_only_fields = fields


class ClearanceSerializer(serializers.ModelSerializer):
    student = ClearanceStudentSerializer(read_only=True)
    clearance_type = ClearanceTypeSerializer(read_only=True)
    initiated_by = SimpleUserSerializer(read_only=True)
    final_approved_by = SimpleUserSerializer(read_only=True, allow_null=True, )
    clearance_offices = ClearanceOfficeSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Clearance
        fields = [
            'id', 'student', 'clearance_type', 'status','initiated_by',
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
    
class ClearanceOfficeProcessSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            ClearanceOffice.Status.CLEARED,
            ClearanceOffice.Status.FLAGGED,
        ]
    )
    notes = serializers.CharField(required=False,  allow_blank=True, )
    issue_reason = serializers.CharField(required=False,  allow_blank=True, )
    issue_description = serializers.CharField(required=False, allow_blank=True, )
    
class IssueResolveSerializer(serializers.Serializer):
    resolution_note = serializers.CharField()


class OfficerClearanceSerializer(serializers.ModelSerializer):
    clearance_id = serializers.IntegerField(source='clearance.id', read_only=True, )
    clearance_status = serializers.CharField(source='clearance.status', read_only=True, )
    student = ClearanceStudentSerializer( source='clearance.student', read_only=True, )
    clearance_type = ClearanceTypeSerializer(source='clearance.clearance_type', read_only=True, )
    office = OfficeSerializer(read_only=True)
    assigned_officer = StaffSerializer(read_only=True, allow_null=True, )
    issues = IssueSerializer(many=True, read_only=True, )

    class Meta:
        model = ClearanceOffice
        fields = [
            'id', 'clearance_id', 'clearance_status', 'student', 'clearance_type', 'office',
            'assigned_officer', 'status', 'notes', 'reviewed_at', 'issues',  
            ]
        read_only_fields = fields
        
class RegistrarClearanceSerializer(serializers.ModelSerializer):
    student = ClearanceStudentSerializer(read_only=True)
    clearance_type = ClearanceTypeSerializer(read_only=True)
    initiated_by = SimpleUserSerializer(read_only=True)
    final_approved_by = SimpleUserSerializer(read_only=True, allow_null=True, )

    class Meta:
        model = Clearance
        fields = [
            'id', 'student', 'clearance_type', 'status', 'initiated_by', 'initiated_at',
            'final_approved_by', 'final_approved_at', 'completed_at', 'submitted_at',
        ]
        read_only_fields = fields
        
class RegistrarIssueSerializer(serializers.ModelSerializer):
    clearance_id = serializers.IntegerField(source='clearance_office.clearance.id', read_only=True )
    student = ClearanceStudentSerializer(source='clearance_office.clearance.student', read_only=True )
    office = OfficeSerializer(source='clearance_office.office', read_only=True )
    clearance_status = serializers.CharField(source='clearance_office.clearance.status', read_only=True )
    created_by = SimpleUserSerializer(read_only=True)
    resolved_by = SimpleUserSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Issue
        fields = [
            'id', 'clearance_id', 'student', 'office', 'clearance_status', 'reason',
            'description', 'status', 'created_by', 'resolved_by', 'resolution_note', 'created_at', 'resolved_at',
        ]
        read_only_fields = fields
        
