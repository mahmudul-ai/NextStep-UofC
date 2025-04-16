from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail

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
    serializer_class = ApplicationSerializer  # Use ApplicationSerializer
    def get_queryset(self):
        user = self.request.user

        # If recruiter, show applications to their posted jobs
        if user.is_authenticated and user.user_type == 'recruiter':
            return Application.objects.filter(job__posted_by=user)

        # If job seeker, show only their own applications (optional feature)
        if user.is_authenticated and user.user_type == 'job_seeker':
            return Application.objects.filter(applicant=user)

        return Application.objects.none()
    # Called when a user applies for a job via POST
    def perform_create(self, serializer):
        user = self.request.user
        # Only users with 'job_seeker' type can apply
        if user.user_type != 'job_seeker':
            raise PermissionDenied("Only job seekers can apply for jobs.")
        # Save the application and associate it with the current user
        serializer.save(applicant=user)
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        app = self.get_object()
        if request.user != app.job.posted_by:
            raise PermissionDenied("Only the job owner can approve this application.")
        
        app.status = 'approved'
        app.save()

        return Response({'message': 'Approval email sent to job seeker.'})

    # Custom reject endpoint
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        app = self.get_object()
        if request.user != app.job.posted_by:
            raise PermissionDenied("Only the job owner can reject this application.")
        
        app.status = 'rejected'
        app.save()
        return Response({'message': 'Rejection email sent to job seeker.'})
    # Same permission logic: safe methods are public, others require authentication
    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return []  # Allow GET without login
        return [IsAuthenticated()]  # Require login for creating or editing applications
