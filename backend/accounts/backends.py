from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend


User = get_user_model()


class UniversityIDBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs, ):
        university_id = kwargs.get('university_id') or username

        if university_id is None or password is None:
            return None

        try:
            user = User.objects.get(university_id=university_id)
        except User.DoesNotExist:
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None