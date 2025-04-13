# jobs/views.py
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied
from .models import Job, Application
from .serializers import JobSerializer, ApplicationSerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'recruiter':
            raise PermissionDenied("Only recruiters can post jobs.")
        serializer.save(posted_by=user)

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return []
        return [IsAuthenticated()]

class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

    def perform_create(self, serializer):
        user = self.request.user
        if user.user_type != 'job_seeker':
            raise PermissionDenied("Only job seekers can apply for jobs.")
        serializer.save(applicant=user)

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return []
        return [IsAuthenticated()]
