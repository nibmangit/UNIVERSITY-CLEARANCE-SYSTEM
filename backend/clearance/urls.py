from django.urls import path

from .views import (
    ClearanceCreateView,
    ClearanceListView,
)


urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
    path('create/', ClearanceCreateView.as_view(), name='clearance-create'),
]