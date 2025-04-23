from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'students', views.StudentViewSet)
router.register(r'posts', views.PostViewSet)
router.register(r'volunteers', views.VolunteerViewSet)
router.register(r'applicants', views.ApplicantViewSet)
router.register(r'moderators', views.ModeratorViewSet)
router.register(r'employers', views.EmployerViewSet)
router.register(r'jobs', views.JobViewSet)
router.register(r'applications', views.ApplicationViewSet)
router.register(r'verifications', views.VerificationViewSet)
router.register(r'employer_verifications', views.EmployerVerificationViewSet)
router.register(r'job_moderations', views.JobModerationViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
