from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    ChangePasswordView,
    CurrentUserProfileView,
    CurrentUserView,
    LoginView,
    RegistrarStudentListView,
)


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('profile/',  CurrentUserProfileView.as_view(), name='current-user-profile', ),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    
    path('students/', RegistrarStudentListView.as_view(), name='registrar-student-list', ),
]
