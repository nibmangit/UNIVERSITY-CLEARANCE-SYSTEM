from django.urls import path

from .views import ClearanceListView


urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
]