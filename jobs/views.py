from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer

# Custom permission: only recruiters can POST/PUT/DELETE
class IsRecruiterOrReadOnly(IsAuthenticated):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.user_type == 'recruiter'

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrReadOnly]

    # This dynamically controls what jobs are shown
    def get_queryset(self):
        user = self.request.user
        request = self.request

    # If recruiter explicitly passed ?mine=true, return their own jobs only
        if user.is_authenticated and user.user_type == 'recruiter':
            if request.query_params.get('mine') == 'true':
                return Job.objects.filter(posted_by=user)

    # For all other cases (including recruiters browsing), return all jobs
        return Job.objects.all()


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
