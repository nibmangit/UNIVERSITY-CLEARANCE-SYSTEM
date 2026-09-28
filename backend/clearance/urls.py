from django.urls import path

from .views import (
    ClearanceCreateView,
    ClearanceListView,
    ClearanceOfficeProcessView,
)


urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
    path('create/', ClearanceCreateView.as_view(), name='clearance-create'),
    path('offices/<int:pk>/', ClearanceOfficeProcessView.as_view(), name='clearance-office-process', ),
]