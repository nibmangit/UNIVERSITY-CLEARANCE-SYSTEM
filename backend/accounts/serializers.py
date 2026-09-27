from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


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

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
        
class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'university_id', 'username', 'role']