from django.urls import path

from .views import (
    ClearanceCreateView,
    ClearanceListView,
    ClearanceOfficeProcessView,
    FinalApproveClearanceView,
    OfficerClearanceListView,
    OfficerIssueListView,
    ResolveIssueView,
)


urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
    path('create/', ClearanceCreateView.as_view(), name='clearance-create'),
    
    path('issues/', OfficerIssueListView.as_view(), name='officer-issue-list',),
    path('issues/<int:pk>/resolve/', ResolveIssueView.as_view(), name='issue-resolve',),
    path('<int:pk>/approve/', FinalApproveClearanceView.as_view(), name='clearance-final-approve',),
    
    path('offices/', OfficerClearanceListView.as_view(), name='officer-clearance-list', ),
    path('offices/<int:pk>/', ClearanceOfficeProcessView.as_view(), name='clearance-office-process', ),
]