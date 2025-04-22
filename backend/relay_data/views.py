from rest_framework import viewsets
from .models import *
from .serializers import *

class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class VolunteerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Volunteer.objects.all()
    serializer_class = VolunteerSerializer

class ApplicantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Applicant.objects.all()
    serializer_class = ApplicantSerializer

class ModeratorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Moderator.objects.all()
    serializer_class = ModeratorSerializer

class EmployerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Employer.objects.all()
    serializer_class = EmployerSerializer

class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class ApplicationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Application.objects.all()
    serializer_class = ApplicationSerializer

class VerificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Verification.objects.all()
    serializer_class = VerificationSerializer

class EmployerVerificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EmployerVerification.objects.all()
    serializer_class = EmployerVerificationSerializer

class JobModerationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobModeration.objects.all()
    serializer_class = JobModerationSerializer
