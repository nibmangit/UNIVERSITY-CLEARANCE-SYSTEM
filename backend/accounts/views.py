from django.db.models import Prefetch, Q
from clearance.models import Clearance

from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from .models import Staff, Student, User
from .permissions import IsRegistrar, IsStudent
from .serializers import (
    CurrentUserSerializer,
    LoginSerializer,
    RegistrarStudentSerializer,
    StaffProfileSerializer,
    StudentProfileSerializer,
)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request}, )
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK,)
    
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CurrentUserSerializer(request.user)

        return Response(serializer.data)
    
class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == User.Role.STUDENT:
            try:
                profile = user.student_profile
            except Student.DoesNotExist:
                raise NotFound('Student profile not found.')

            serializer = StudentProfileSerializer(profile)
            return Response(serializer.data)

        if user.role in [
            User.Role.OFFICER,
            User.Role.REGISTRAR,
            User.Role.ADMIN,
        ]:
            try:
                profile = user.staff_profile
            except Staff.DoesNotExist:
                raise NotFound('Staff profile not found.')

            serializer = StaffProfileSerializer(profile)
            return Response(serializer.data)

        raise NotFound('Profile not found.')
    

class RegistrarStudentListView(APIView):
    permission_classes = [IsAuthenticated, IsRegistrar]

    def get(self, request):
        students = (
            Student.objects
            .select_related('faculty', 'department', 'section')
            .prefetch_related(
                Prefetch('clearances', queryset=Clearance.objects.select_related('clearance_type'))
            )
            .order_by('student_id')
        )

        search = request.query_params.get('search', '').strip()
        if search:
            students = students.filter(
                Q(student_id__icontains=search) | Q(full_name__icontains=search)
            )

        serializer = RegistrarStudentSerializer(students, many=True)
        return Response(serializer.data)