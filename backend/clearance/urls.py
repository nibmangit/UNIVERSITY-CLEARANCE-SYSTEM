from django.urls import path

from .views import (
    ClearanceCreateView, ClearanceDetailView, ClearanceListView, ClearanceOfficeProcessView, FinalApproveClearanceView,
    OfficerClearanceListView, OfficerIssueListView, RegistrarClearanceListView, RegistrarIssueListView,
    ResolveIssueView,
)
from .dashboard_view import OfficerDashboardView, RegistrarDashboardView, StudentDashboardView

urlpatterns = [
    path('', ClearanceListView.as_view(), name='clearance-list'),
    path('<int:pk>/',  ClearanceDetailView.as_view(), name='clearance-detail', ),
    
    path('create/', ClearanceCreateView.as_view(), name='clearance-create'),
    path('<int:pk>/approve/', FinalApproveClearanceView.as_view(), name='clearance-final-approve',),
    
    path('issues/', OfficerIssueListView.as_view(), name='officer-issue-list',),
    path('issues/<int:pk>/resolve/', ResolveIssueView.as_view(), name='issue-resolve',),
    
    path('offices/', OfficerClearanceListView.as_view(), name='officer-clearance-list', ),
    path('offices/<int:pk>/', ClearanceOfficeProcessView.as_view(), name='clearance-office-process', ),
    
    path('registrar/', RegistrarClearanceListView.as_view(), name='registrar-clearance-list' ),
    path('registrar/issues/', RegistrarIssueListView.as_view(), name='registrar-issue-list' ),
    
    
    #### DASHBOARD URLS ####
    path('officer/dashboard/', OfficerDashboardView.as_view(), name='officer-dashboard' ),
    path('registrar/dashboard/', RegistrarDashboardView.as_view(), name='registrar-dashboard' ),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard' ),
]