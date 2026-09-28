from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound

from .models import Staff, Student, User
from .permissions import IsStudent
from .serializers import (
    CurrentUserSerializer,
    LoginSerializer,
    StaffProfileSerializer,
    StudentProfileSerializer,
)


class LoginView(APIView):

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