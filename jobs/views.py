# Importing necessary DRF components and models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer
from rest_framework.permissions import BasePermission

# Custom permission: only recruiters can POST, PUT, DELETE
class IsRecruiterOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True  # Allow anyone to view jobs
        return request.user.is_authenticated and request.user.user_type == 'recruiter'

# ViewSet to handle all CRUD operations for Job objects
class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # Allow everyone to view all jobs
        if self.request.method in SAFE_METHODS:
            return Job.objects.all()

        # If recruiter is modifying, only allow their own jobs
        if user.is_authenticated and user.user_type == 'recruiter':
            return Job.objects.filter(posted_by=user)

        # All others get an empty queryset for write actions
        return Job.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'recruiter':
            raise PermissionDenied("Only recruiters can post jobs.")
        serializer.save(posted_by=user)

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
