from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('health/', health),
    path('api/auth/', include('accounts.urls')),
    path('api/clearances/', include('clearance.urls')),
    path('api/notifications/', include('notifications.urls')),
]