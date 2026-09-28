from django.urls import path

from .views import (
    ClearanceCreateView,
    ClearanceListView,
    ClearanceOfficeProcessView,
    ResolveIssueView,
)


urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
    path('create/', ClearanceCreateView.as_view(), name='clearance-create'),
    path('offices/<int:pk>/', ClearanceOfficeProcessView.as_view(), name='clearance-office-process', ),
    path('issues/<int:pk>/resolve/', ResolveIssueView.as_view(), name='issue-resolve',
),
]