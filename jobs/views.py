# Importing necessary DRF components and models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer

# ViewSet to handle all CRUD operations for Job objects
class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()  # Fetch all Job records
    serializer_class = JobSerializer  # Use JobSerializer to handle data representation

    # Called when a new job is being created via POST
    def perform_create(self, serializer):
        user = self.request.user
        # Enforce that only recruiters can post jobs
        if user.user_type != 'recruiter':
            raise PermissionDenied("Only recruiters can post jobs.")
        # Save the job and associate it with the current user
        serializer.save(posted_by=user)

    # Custom permissions logic: allow unauthenticated users to view (GET), but restrict other methods
    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return []  # No authentication needed for safe methods like GET
        return [IsAuthenticated()]  # Auth required for POST, PUT, DELETE, etc.

# ViewSet to handle all CRUD operations for Applications
class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()  # Fetch all applications
    serializer_class = ApplicationSerializer  # Use ApplicationSerializer

    # Called when a user applies for a job via POST
    def perform_create(self, serializer):
        user = self.request.user
        # Only users with 'job_seeker' type can apply
        if user.user_type != 'job_seeker':
            raise PermissionDenied("Only job seekers can apply for jobs.")
        # Save the application and associate it with the current user
        serializer.save(applicant=user)

    # Same permission logic: safe methods are public, others require authentication
    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return []  # Allow GET without login
        return [IsAuthenticated()]  # Require login for creating or editing applications
